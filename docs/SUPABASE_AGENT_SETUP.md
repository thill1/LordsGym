# Allow the AI Agent to Run Supabase Migrations

The agent can run `npm run db:push` to apply Supabase migrations **if** you add an access token to `.env.local`.

## One-time setup

### 1. Get your Supabase access token

1. Open **[Supabase Dashboard → Account → Access Tokens](https://supabase.com/dashboard/account/tokens)**
2. Click **Generate new token**
3. Name it (e.g. `LordsGym CLI`)
4. Copy the token (starts with `sbp_`)

### 2. Add it to .env.local

Add this line to `c:\Users\troyh\LordsGym\.env.local` (create the file if needed):

```
SUPABASE_ACCESS_TOKEN=sbp_your_token_here
```

`.env.local` is in `.gitignore` and is **not** committed. The token stays local.

### 3. Done

The agent can now run `npm run db:push` and `supabase db push` will use this token.

## What the agent can do

With the token configured:

- **Apply migrations**: `npm run db:push`
- **Verify RPC**: `npm run test:calendar-rpc`
- Create new migrations in `supabase/migrations/`

## Security notes

- Never commit `.env.local` or paste the token in chat
- Rotate the token in the Supabase dashboard if you think it was exposed
- The token has account-level access; use a dedicated token for this project if you prefer
