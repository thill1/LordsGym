import Stripe from 'https://esm.sh/stripe@13.0.0?dts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ACTUAL Lords Gym Membership Pricing (in cents)
const PRICING = {
  'regular': {
    monthly: 3900,    // $39.00/month
    setupFee: 3900,   // $39.00 one-time
  },
  'student': {
    monthly: 2900,    // $29.00/month
    setupFee: 3900,   // $39.00 one-time
  },
  'annual': {
    yearly: 36000,    // $360.00/year
    setupFee: 0,      // No setup fee
  },
};

const getProductName = (type: string): string => {
  const names: Record<string, string> = {
    'regular': 'Regular Monthly Membership - Lords Gym',
    'student': 'Student Monthly Membership - Lords Gym',
    'annual': '1 Year Paid In Full - Lords Gym',
  };
  return names[type] || 'Lords Gym Membership';
};

const getMode = (type: string): 'payment' | 'subscription' => {
  return type === 'annual' ? 'payment' : 'subscription';
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    });

    const { membership_type, customer_email, user_id } = await req.json();

    if (!membership_type || !customer_email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mode = getMode(membership_type);
    const productName = getProductName(membership_type);
    const pricing = PRICING[membership_type as keyof typeof PRICING];

    if (!pricing) {
      return new Response(
        JSON.stringify({ error: 'Invalid membership type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (membership_type === 'annual') {
      // Annual: One-time payment of $360, no setup fee
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: productName,
            description: '1 Year Paid In Full - No setup fee',
          },
          unit_amount: pricing.yearly,
        },
        quantity: 1,
      });
    } else {
      // Monthly: Subscription + one-time setup fee
      const monthlyPrice = membership_type === 'regular' ? pricing.monthly : pricing.monthly;
      
      // Main subscription
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: productName,
            description: membership_type === 'student' 
              ? 'Valid student ID required. 24 HR Access.'
              : '24 HR Access. No long-term contracts.',
          },
          unit_amount: monthlyPrice,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      });

      // Setup fee (one-time)
      if (pricing.setupFee > 0) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Initiation / Setup Fee',
              description: 'One-time onboarding, mobile app activation, and 24/7 access setup',
            },
            unit_amount: pricing.setupFee,
          },
          quantity: 1,
        });
      }
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email,
      client_reference_id: user_id,
      metadata: {
        membership_type,
        user_id,
      },
      line_items: lineItems,
      mode,
      success_url: `${req.headers.get('origin')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/membership?canceled=true`,
    });

    // Log the checkout attempt to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseKey) {
      const totalAmount = lineItems.reduce((sum, item) => {
        return sum + (item.price_data?.unit_amount || 0);
      }, 0);

      await fetch(`${supabaseUrl}/rest/v1/payment_intents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          user_id,
          membership_type,
          stripe_session_id: session.id,
          amount: totalAmount,
          status: 'pending',
          created_at: new Date().toISOString(),
        }),
      });
    }

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
