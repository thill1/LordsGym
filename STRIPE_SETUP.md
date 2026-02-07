# Stripe Integration Setup Guide

## Overview
This adds Stripe payment processing to Lords Gym for memberships.

## Files Created
- `supabase/functions/stripe-checkout/index.ts` - Creates Stripe checkout sessions
- `supabase/functions/stripe-webhook/index.ts` - Handles Stripe webhooks
- `src/components/MembershipCheckout.tsx` - React component for membership selection

## Stripe Setup Steps

### 1. Create Stripe Account
- Go to https://stripe.com and sign up
- Complete verification (business details, bank account)

### 2. Get API Keys
In your Stripe Dashboard:
- **Test Mode**: Developers → API keys
  - Publishable key: `pk_test_...`
  - Secret key: `sk_test_...`
- **Live Mode**: Toggle "Test mode" off, repeat above for production keys

### 3. Configure Supabase Secrets

```bash
# Install Supabase CLI if not already installed
brew install supabase/tap/supabase

# Link your project
cd /Users/thill/.openclaw/workspace/LordsGym
supabase link --project-ref YOUR_PROJECT_REF

# Set environment variables
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here
supabase secrets set STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Deploy Edge Functions

```bash
# Deploy both functions
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
```

### 5. Set Up Webhook Endpoint

In Stripe Dashboard:
1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret
6. Update `STRIPE_WEBHOOK_SECRET` in Supabase secrets

### 6. Update Frontend Environment

Add to your `.env` file:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 7. Database Setup

Run these SQL commands in Supabase SQL Editor:

```sql
-- Memberships table
CREATE TABLE IF NOT EXISTS memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    membership_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'inactive',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Payment intents tracking
CREATE TABLE IF NOT EXISTS payment_intents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    membership_type VARCHAR(50) NOT NULL,
    stripe_session_id VARCHAR(255) UNIQUE,
    amount INTEGER NOT NULL, -- in cents
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own membership" ON memberships
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payment intents" ON payment_intents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage memberships" ON memberships
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage payment intents" ON payment_intents
    FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_stripe_subscription ON memberships(stripe_subscription_id);
CREATE INDEX idx_payment_intents_session ON payment_intents(stripe_session_id);
```

### 8. Add Component to App

In your App.tsx or router:
```tsx
import MembershipCheckout from './components/MembershipCheckout';

// Add route
<Route path="/membership" element={<MembershipCheckout />} />
```

## Membership Pricing (ACTUAL Lords Gym Pricing)

| Type | Price | Setup Fee | Interval |
|------|-------|-----------|----------|
| Regular Monthly | $39 | $39 one-time | Monthly subscription |
| Student Monthly | $29 | $39 one-time | Monthly subscription |
| 1 Year Paid In Full | $360 | None | One-time payment |

**Key Features:**
- No long-term contracts
- No annual fees
- 24 HR Access
- Student discount available (valid ID required)

## Testing

### Test Cards (Stripe Test Mode)
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Requires any future expiry date and 3-digit CVC

### Test Flow
1. Go to `/membership`
2. Select a membership
3. Enter test card details
4. Complete payment
5. Check webhook logs and database updates

## Monitoring

### Stripe Dashboard
- View payments: https://dashboard.stripe.com/payments
- View subscriptions: https://dashboard.stripe.com/subscriptions
- Webhook logs: https://dashboard.stripe.com/webhooks

### Supabase Logs
```bash
supabase functions logs stripe-webhook --tail
supabase functions logs stripe-checkout --tail
```

## Going Live Checklist

- [ ] Switch to Stripe Live mode
- [ ] Update Supabase secrets with live keys
- [ ] Update `.env` with live Stripe publishable key
- [ ] Update webhook endpoint in Stripe dashboard
- [ ] Test one live transaction with small amount
- [ ] Configure Stripe email receipts
- [ ] Set up Stripe tax (if applicable)

## Support
- Stripe docs: https://stripe.com/docs
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Webhook troubleshooting: Check Supabase function logs
