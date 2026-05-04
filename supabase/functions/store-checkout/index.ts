import Stripe from 'https://esm.sh/stripe@13.0.0?dts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  selectedSize: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const { items, customerEmail, customerName } = await req.json() as {
      items: CartItem[];
      customerEmail: string;
      customerName?: string;
    };

    if (!items?.length || !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: items, customerEmail' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.title}${item.selectedSize ? ` — ${item.selectedSize}` : ''}`,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const totalCents = items.reduce(
      (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
      0
    );

    const origin = req.headers.get('origin') || 'https://lordsgymoutreach.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      metadata: {
        order_type: 'store',
        customer_name: customerName || '',
        customer_email: customerEmail,
      },
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/#/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#/checkout`,
    });

    // Pre-create the order row so confirmation page can load immediately
    const orderPayload = {
      stripe_session_id: session.id,
      customer_email: customerEmail,
      customer_name: customerName || null,
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        size: item.selectedSize,
        quantity: item.quantity,
        price_cents: Math.round(item.price * 100),
      })),
      total_cents: totalCents,
      status: 'pending',
    };

    const dbRes = await fetch(`${supabaseUrl}/rest/v1/store_orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(orderPayload),
    });

    if (!dbRes.ok) {
      const errText = await dbRes.text();
      console.error('Failed to pre-create store_order:', dbRes.status, errText);
      // Don't fail the checkout — Stripe session is created; webhook will upsert the row
    }

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('store-checkout error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
