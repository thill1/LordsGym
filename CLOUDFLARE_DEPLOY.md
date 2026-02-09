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

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_BASE_PATH` | `/` | **Yes** – Cloudflare serves at root |
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Yes |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key` | Yes |

(Production values - don't use test keys for production!)

> **Important:** `VITE_BASE_PATH` must be `/` for Cloudflare Pages. Without it, assets will 404.

## Step 4: Deploy

Click **Save and Deploy** - Cloudflare will:
1. Clone your repo
2. Run `npm install && npm run build`
3. Deploy to `lords-gym.pages.dev`

### Alternative A: Automated via GitHub Actions

A workflow deploys to Cloudflare Pages on every push to `main`.

**Setup (one-time):**

1. **Get Cloudflare API token**
   - Cloudflare Dashboard → My Profile → API Tokens → Create Token
   - Use template **Edit Cloudflare Workers** (or custom: Pages:Edit permission)
   - Copy the token

2. **Get Account ID**
   - Cloudflare Dashboard → any page, right sidebar under **Account ID**

3. **Add GitHub Secrets**
   - Repo → Settings → Secrets and variables → Actions
   - Add: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
   - Also add if not already present: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

4. **Push to `main`** – the workflow runs automatically

You can also trigger manually: Actions → **Deploy to Cloudflare Pages** → Run workflow.

### Alternative B: Direct deploy with Wrangler (local)

```bash
# Install wrangler (if not already)
npm install -g wrangler

# Build with Cloudflare base path
VITE_BASE_PATH=/ npm run build

# Deploy
npx wrangler pages deploy dist --project-name=lords-gym-auburn
```

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

## Project Configuration (Already Set Up)

- **`public/_redirects`** – SPA routing: all routes serve `index.html` (required for hash routing)
- **Vite base path** – Uses `VITE_BASE_PATH` env var (set to `/` for Cloudflare)

## Cloudflare Git: Use Build + Output, Not Deploy Command

For **Git integration**, use only:
- **Build command:** `npm run build`
- **Build output directory:** `dist`

Leave the **Deploy command** blank. Cloudflare deploys the build output automatically. A custom deploy command that runs `wrangler` can fail with "Configuration file for Pages projects does not support 'build'".

## Go Live Checklist

- [ ] `VITE_BASE_PATH=/` set in Cloudflare environment variables
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
