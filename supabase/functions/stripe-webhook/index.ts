import Stripe from 'https://esm.sh/stripe@13.0.0?dts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16',
  });

  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!signature || !webhookSecret) {
    return new Response(
      JSON.stringify({ error: 'Missing stripe-signature or webhook secret' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(
      JSON.stringify({ error: 'Invalid signature' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('Processing webhook event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { user_id, membership_type } = session.metadata || {};
        
        if (!user_id || !membership_type) {
          console.error('Missing metadata in session:', session.id);
          break;
        }

        // Calculate membership end date based on type
        const startDate = new Date();
        const endDate = new Date();
        
        if (membership_type === 'annual') {
          // 1 Year Paid In Full
          endDate.setFullYear(startDate.getFullYear() + 1);
        } else {
          // Monthly (Regular or Student) - 1 month
          endDate.setMonth(startDate.getMonth() + 1);
        }

        // Update or insert membership in Supabase
        const membershipData = {
          user_id,
          membership_type,
          status: 'active',
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          current_period_start: startDate.toISOString(),
          current_period_end: endDate.toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (supabaseUrl && supabaseKey) {
          // Upsert membership
          await fetch(`${supabaseUrl}/rest/v1/memberships?user_id=eq.${user_id}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates,return=minimal',
            },
            body: JSON.stringify(membershipData),
          });

          // Update payment intent to completed
          await fetch(`${supabaseUrl}/rest/v1/payment_intents?stripe_session_id=eq.${session.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              status: 'completed',
              completed_at: new Date().toISOString(),
            }),
          });

          console.log('✅ Membership activated for user:', user_id, 'Type:', membership_type);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription;
        
        if (subscriptionId && supabaseUrl && supabaseKey) {
          // Extend membership period for monthly subscriptions
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1);

          await fetch(`${supabaseUrl}/rest/v1/memberships?stripe_subscription_id=eq.${subscriptionId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              current_period_end: endDate.toISOString(),
              status: 'active',
              updated_at: new Date().toISOString(),
            }),
          });

          console.log('✅ Monthly subscription renewed:', subscriptionId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        if (supabaseUrl && supabaseKey) {
          await fetch(`${supabaseUrl}/rest/v1/memberships?stripe_subscription_id=eq.${subscription.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              status: 'canceled',
              updated_at: new Date().toISOString(),
            }),
          });

          console.log('❌ Membership canceled:', subscription.id);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
