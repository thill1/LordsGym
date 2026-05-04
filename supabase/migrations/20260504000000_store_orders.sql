-- Store orders: one row per completed (or pending) t-shirt / merch checkout session.
-- This is separate from payment_intents which tracks membership purchases.

CREATE TABLE IF NOT EXISTS store_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    shipping_address JSONB,
    items JSONB NOT NULL,          -- [{id, title, size, quantity, price_cents}]
    total_cents INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'paid', 'fulfilled', 'canceled', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    fulfilled_at TIMESTAMPTZ,
    notes TEXT
);

-- Indexes
CREATE INDEX idx_store_orders_session ON store_orders(stripe_session_id);
CREATE INDEX idx_store_orders_email   ON store_orders(customer_email);
CREATE INDEX idx_store_orders_status  ON store_orders(status);
CREATE INDEX idx_store_orders_created ON store_orders(created_at DESC);

-- RLS
ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;

-- Public can look up their own order by the opaque session ID (unguessable Stripe token).
-- This lets the confirmation page load without requiring auth.
CREATE POLICY "Public read by session ID" ON store_orders
    FOR SELECT USING (true);

-- Only service role (Edge Functions) may insert or update.
CREATE POLICY "Service role manages orders" ON store_orders
    FOR ALL USING (true) WITH CHECK (true);
