-- Stripe Integration Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Memberships table: Tracks active memberships for users
CREATE TABLE IF NOT EXISTS memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    membership_type VARCHAR(50) NOT NULL CHECK (membership_type IN ('day-pass', 'monthly-basic', 'monthly-pro', 'annual')),
    status VARCHAR(20) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'canceled', 'past_due')),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Payment intents tracking: Records checkout attempts and status
CREATE TABLE IF NOT EXISTS payment_intents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    membership_type VARCHAR(50) NOT NULL,
    stripe_session_id VARCHAR(255) UNIQUE,
    amount INTEGER NOT NULL, -- in cents
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'canceled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY "Users can view own membership" ON memberships
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payment intents" ON payment_intents
    FOR SELECT USING (auth.uid() = user_id);

-- Service role policies for webhook functions (bypass RLS)
CREATE POLICY "Service role can manage memberships" ON memberships
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage payment intents" ON payment_intents
    FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_stripe_subscription ON memberships(stripe_subscription_id);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_payment_intents_user ON payment_intents(user_id);
CREATE INDEX idx_payment_intents_session ON payment_intents(stripe_session_id);
CREATE INDEX idx_payment_intents_status ON payment_intents(status);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update timestamps
DROP TRIGGER IF EXISTS update_memberships_updated_at ON memberships;
CREATE TRIGGER update_memberships_updated_at
    BEFORE UPDATE ON memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- View: Active memberships with user info
CREATE OR REPLACE VIEW active_memberships_view AS
SELECT 
    m.id,
    m.user_id,
    u.email as user_email,
    m.membership_type,
    m.status,
    m.current_period_start,
    m.current_period_end,
    m.stripe_subscription_id,
    CASE 
        WHEN m.current_period_end < NOW() THEN 'expired'
        WHEN m.current_period_end < NOW() + INTERVAL '7 days' THEN 'expires_soon'
        ELSE 'active'
    END as renewal_status
FROM memberships m
JOIN auth.users u ON m.user_id = u.id
WHERE m.status = 'active';

-- Function: Check if user has active membership
CREATE OR REPLACE FUNCTION has_active_membership(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM memberships 
        WHERE user_id = p_user_id 
        AND status = 'active' 
        AND current_period_end > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user membership details
CREATE OR REPLACE FUNCTION get_user_membership(p_user_id UUID)
RETURNS TABLE (
    membership_type VARCHAR,
    status VARCHAR,
    current_period_end TIMESTAMP WITH TIME ZONE,
    days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.membership_type,
        m.status,
        m.current_period_end,
        EXTRACT(DAY FROM (m.current_period_end - NOW()))::INTEGER as days_remaining
    FROM memberships m
    WHERE m.user_id = p_user_id
    AND m.status = 'active'
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION has_active_membership(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_membership(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_active_membership(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_user_membership(UUID) TO anon;
