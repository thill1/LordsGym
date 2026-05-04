import Stripe from 'https://esm.sh/stripe@13.0.0?dts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NOTIFY_EMAIL = 'lordsgymoutreach@gmail.com';
const FROM_EMAIL = 'orders@lordsgymoutreach.com';
const FROM_NAME = "Lord's Gym";

interface OrderItem {
  id: string;
  title: string;
  size: string;
  quantity: number;
  price_cents: number;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function buildOrderEmailHtml(
  orderId: string,
  customerName: string,
  customerEmail: string,
  shippingAddress: Stripe.Address | null,
  items: OrderItem[],
  totalCents: number
): string {
  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${item.title}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.size}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatCents(item.price_cents * item.quantity)}</td>
      </tr>`
    )
    .join('');

  const addressHtml = shippingAddress
    ? `${shippingAddress.line1 || ''}${shippingAddress.line2 ? ', ' + shippingAddress.line2 : ''}<br>
       ${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.postal_code || ''}`
    : 'Not provided';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
  <div style="background:#c0392b;padding:20px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:24px;">New Store Order</h1>
  </div>
  <div style="padding:24px;">
    <p style="font-size:16px;margin-top:0;">A new order has been placed and payment confirmed.</p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td style="padding:6px 0;font-weight:bold;width:140px;">Order ID</td><td style="padding:6px 0;font-family:monospace;">${orderId}</td></tr>
      <tr><td style="padding:6px 0;font-weight:bold;">Customer</td><td style="padding:6px 0;">${customerName || '—'}</td></tr>
      <tr><td style="padding:6px 0;font-weight:bold;">Email</td><td style="padding:6px 0;"><a href="mailto:${customerEmail}">${customerEmail}</a></td></tr>
      <tr><td style="padding:6px 0;font-weight:bold;vertical-align:top;">Ship To</td><td style="padding:6px 0;">${addressHtml}</td></tr>
    </table>

    <h3 style="border-bottom:2px solid #c0392b;padding-bottom:8px;">Items Ordered</h3>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:8px;text-align:left;">Item</th>
          <th style="padding:8px;text-align:center;">Size</th>
          <th style="padding:8px;text-align:center;">Qty</th>
          <th style="padding:8px;text-align:right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding:12px 8px;font-weight:bold;text-align:right;">Total</td>
          <td style="padding:12px 8px;font-weight:bold;text-align:right;font-size:18px;">${formatCents(totalCents)}</td>
        </tr>
      </tfoot>
    </table>

    <div style="margin-top:24px;padding:16px;background:#f9f9f9;border-radius:4px;font-size:13px;color:#666;">
      <strong>Next step:</strong> Package and ship the order. Reply to <a href="mailto:${customerEmail}">${customerEmail}</a> with tracking info.
    </div>
  </div>
  <div style="background:#f0f0f0;padding:12px;text-align:center;font-size:12px;color:#999;">
    Lord's Gym Auburn · 258 Elm Ave, Auburn, CA 95603
  </div>
</body>
</html>`;
}

async function sendOrderEmail(
  resendKey: string,
  orderId: string,
  customerName: string,
  customerEmail: string,
  shippingAddress: Stripe.Address | null,
  items: OrderItem[],
  totalCents: number
): Promise<void> {
  const html = buildOrderEmailHtml(orderId, customerName, customerEmail, shippingAddress, items, totalCents);
  const itemSummary = items.map((i) => `${i.title} (${i.size}) x${i.quantity}`).join(', ');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [NOTIFY_EMAIL],
      reply_to: customerEmail,
      subject: `[New Order] ${itemSummary} — ${formatCents(totalCents)}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Resend failed ${res.status}: ${JSON.stringify(err)}`);
  }
}

async function handleStoreOrder(
  session: Stripe.Checkout.Session,
  supabaseUrl: string,
  supabaseKey: string,
  resendKey: string | undefined
): Promise<void> {
  const customerEmail = session.customer_details?.email || session.customer_email || '';
  const customerName = session.customer_details?.name || session.metadata?.customer_name || '';
  const shippingAddress = session.shipping_details?.address || null;
  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : null;

  // Fetch the pre-created order to get items and total
  const fetchRes = await fetch(
    `${supabaseUrl}/rest/v1/store_orders?stripe_session_id=eq.${session.id}&select=id,items,total_cents`,
    {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
    }
  );

  let orderId = session.id;
  let items: OrderItem[] = [];
  let totalCents = 0;

  if (fetchRes.ok) {
    const rows = await fetchRes.json() as { id: string; items: OrderItem[]; total_cents: number }[];
    if (rows.length > 0) {
      orderId = rows[0].id;
      items = rows[0].items || [];
      totalCents = rows[0].total_cents;
    }
  }

  // Update the order row to paid
  const updatePayload: Record<string, unknown> = {
    status: 'paid',
    paid_at: new Date().toISOString(),
    customer_name: customerName || null,
    customer_email: customerEmail || null,
    shipping_address: shippingAddress || null,
  };
  if (paymentIntentId) updatePayload.stripe_payment_intent_id = paymentIntentId;

  const updateRes = await fetch(
    `${supabaseUrl}/rest/v1/store_orders?stripe_session_id=eq.${session.id}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(updatePayload),
    }
  );

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    console.error('Failed to update store_order to paid:', updateRes.status, errText);
    // Don't throw — we still want to send the email
  } else {
    console.log('✅ Store order marked paid:', session.id);
  }

  // Send fulfillment email
  if (resendKey && customerEmail) {
    try {
      await sendOrderEmail(resendKey, orderId, customerName, customerEmail, shippingAddress, items, totalCents);
      console.log('✅ Order email sent to', NOTIFY_EMAIL);
    } catch (emailErr) {
      console.error('Order email failed (non-fatal):', emailErr);
    }
  } else if (!resendKey) {
    console.warn('RESEND_API_KEY not set — order email skipped');
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16',
  });

  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const resendKey = Deno.env.get('RESEND_API_KEY');

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
        const orderType = session.metadata?.order_type;

        if (orderType === 'store') {
          await handleStoreOrder(session, supabaseUrl, supabaseKey, resendKey);
          break;
        }

        // --- Membership checkout (existing logic) ---
        const { user_id, membership_type } = session.metadata || {};
        if (!user_id || !membership_type) {
          console.error('Missing metadata in membership session:', session.id);
          break;
        }

        const startDate = new Date();
        const endDate = new Date();
        if (membership_type === 'annual') {
          endDate.setFullYear(startDate.getFullYear() + 1);
        } else {
          endDate.setMonth(startDate.getMonth() + 1);
        }

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

        await fetch(`${supabaseUrl}/rest/v1/payment_intents?stripe_session_id=eq.${session.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ status: 'completed', completed_at: new Date().toISOString() }),
        });

        console.log('✅ Membership activated for user:', user_id, 'Type:', membership_type);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription;
        if (subscriptionId) {
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
        await fetch(`${supabaseUrl}/rest/v1/memberships?stripe_subscription_id=eq.${subscription.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ status: 'canceled', updated_at: new Date().toISOString() }),
        });
        console.log('❌ Membership canceled:', subscription.id);
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
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
