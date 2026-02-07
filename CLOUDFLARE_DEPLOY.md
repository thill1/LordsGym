# Cloudflare Pages Deployment Guide for Lords Gym

## Prerequisites
- Cloudflare account (free tier works)
- GitHub repo connected to Cloudflare

## Step 1: Connect Repo to Cloudflare Pages

1. Go to https://dash.cloudflare.com/
2. Navigate to **Pages** → **Create a project**
3. Click **Connect to Git**
4. Select your GitHub account and the `LordsGym` repo
5. Click **Begin setup**

## Step 2: Build Settings

Use these settings:

| Setting | Value |
|---------|-------|
| **Project name** | `lords-gym` (or your preferred name) |
| **Production branch** | `main` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (default) |

## Step 3: Environment Variables

Add these in Cloudflare Pages → Settings → Environment variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

(Production values - don't use test keys for production!)

## Step 4: Deploy

Click **Save and Deploy** - Cloudflare will:
1. Clone your repo
2. Run `npm install && npm run build`
3. Deploy to `lords-gym.pages.dev`

## Step 5: Custom Domain (Optional)

1. In Cloudflare Pages → Custom domains
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `lordsgym.com`)
4. Follow Cloudflare's DNS instructions

## Step 6: Supabase Edge Functions

After the frontend is deployed, deploy the Stripe functions:

```bash
cd /Users/thill/.openclaw/workspace/LordsGym

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Deploy edge functions
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_key
supabase secrets set STRIPE_PUBLISHABLE_KEY=pk_live_your_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

## Step 7: Stripe Webhook URL

In Stripe Dashboard → Webhooks:
- Endpoint URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
- Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`

## Testing Before Launch

1. Test build locally: `npm run build && npm run preview`
2. Test Stripe in TEST mode first
3. Use Stripe test card: `4242 4242 4242 4242`
4. Verify webhook is receiving events

## Go Live Checklist

- [ ] All code committed and pushed to main
- [ ] Cloudflare Pages site deployed successfully
- [ ] Custom domain configured (if using)
- [ ] Supabase edge functions deployed
- [ ] Stripe LIVE keys configured in Supabase secrets
- [ ] Stripe webhook configured with production URL
- [ ] Test payment flow end-to-end
- [ ] SSL certificate active (Cloudflare provides this)

## Support

- Cloudflare Pages docs: https://developers.cloudflare.com/pages/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Stripe Testing: https://stripe.com/docs/testing
