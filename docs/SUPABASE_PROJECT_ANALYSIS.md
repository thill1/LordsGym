# Supabase Project Configuration Analysis

**Project:** mrptukahxloqpdqiaxkb (Lords Gym)  
**Fetched:** 2026-02-22 via Supabase Management API  
**Purpose:** Diagnose 522 / timeout issues; verify auth, network, and database settings

---

## 1. Project Details (Full Config)

| Field | Value |
|-------|-------|
| **id** | mrptukahxloqpdqiaxkb |
| **ref** | mrptukahxloqpdqiaxkb |
| **name** | Lords Gym |
| **organization_id** | jnmryjkxvmyuelvbnwaa |
| **region** | us-west-2 |
| **status** | ACTIVE_HEALTHY |
| **created_at** | 2026-01-27T17:06:33.540574Z |

### Database Info
| Field | Value |
|-------|-------|
| **host** | db.mrptukahxloqpdqiaxkb.supabase.co |
| **version** | 17.6.1.063 |
| **postgres_engine** | 17 |
| **release_channel** | ga |

---

## 2. Auth Config

### URL & Redirect

| Setting | Value | Status |
|---------|-------|--------|
| **site_url** | `http://localhost:3000` | Misconfigured |
| **uri_allow_list** | *(empty string)* | Misconfigured |
| **redirect_urls** | *(not exposed by API)* | See Dashboard |

### Request / Timeout Limits
| Setting | Value | Notes |
|---------|-------|-------|
| **api_max_request_duration** | 10 seconds | Auth API request timeout |
| **jwt_exp** | 3600 (1 hour) | JWT expiry |
| **db_max_pool_size** | 10 connections | Per-instance pool |

### Providers Enabled
| Provider | Enabled |
|----------|---------|
| **Email (external_email_enabled)** | Yes |
| **Apple, Azure, Bitbucket, Discord** | No |
| **Facebook, Figma, GitHub, GitLab, Google** | No |
| **Phone, Slack, Twitter/X, etc.** | No |

### Session & MFA
| Setting | Value |
|---------|-------|
| **sessions_timebox** | 0 |
| **sessions_inactivity_timeout** | 0 |
| **sessions_single_per_user** | false |
| **mfa_max_enrolled_factors** | 10 |
| **mfa_totp_enroll_enabled** | true |

### Rate Limits (relevant to timeouts)
| Limit | Value |
|-------|-------|
| **rate_limit_anonymous_users** | 30 |
| **rate_limit_token_refresh** | 150 |
| **rate_limit_email_sent** | 2 |

---

## 3. Network / Restriction Settings

| Setting | Value | Implication |
|---------|-------|-------------|
| **entitlement** | allowed | Network restrictions feature available |
| **dbAllowedCidrs** | `["0.0.0.0/0"]` | No IPv4 restrictions |
| **dbAllowedCidrsV6** | `["::/0"]` | No IPv6 restrictions |

**Summary:** No network bans or CIDR restrictions. GitHub Actions runners and Cloudflare should be able to reach Supabase.

---

## 4. Database Settings

### Pooler (Supavisor)
| Field | Value |
|-------|-------|
| **db_host** | aws-0-us-west-2.pooler.supabase.com |
| **db_port** | 6543 |
| **pool_mode** | transaction |
| **database_type** | PRIMARY |
| **is_using_scram_auth** | true |

### PgBouncer
| Setting | Value | Notes |
|---------|-------|-------|
| **pool_mode** | transaction | Standard for serverless |
| **server_idle_timeout** | 600 sec | Idle connection closed after 10 min |
| **server_lifetime** | 3600 sec | Connection recycled after 1 hour |
| **query_wait_timeout** | 80 sec | Max wait for backend; can cause timeouts |
| **reserve_pool_size** | 1 | Small reserve pool |

### Custom Hostname
- **Status:** Custom Domain add-on not enabled. Using default `*.supabase.co` hostname.
- **Note:** No custom domain → no DNS/origin config that would cause 522 from hostname issues.

---

## 5. Misconfigurations & 522/Timeout Risk

### HIGH – Auth URL Mismatch

| Issue | Current | Recommended |
|-------|---------|-------------|
| **site_url** | `http://localhost:3000` | `https://lords-gym.pages.dev` or `https://lordsgymoutreach.com` |
| **uri_allow_list** | empty | Add redirect URLs for production |

**Impact:** Auth redirects and email links may fail or point to localhost in production. Not a direct cause of 522, but will break login flows.

**Action:**
1. Supabase Dashboard → [Auth → URL Configuration](https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/auth/url-configuration)
2. Set **Site URL** to `https://lords-gym.pages.dev` (or primary production URL)
3. Add **Redirect URLs**:  
   - `https://lords-gym.pages.dev/**`  
   - `https://lordsgymoutreach.com/**`  
   - `https://lordsgymoutreach.com/#/**`

### MEDIUM – Database Query Timeouts

| Setting | Value | Risk |
|---------|-------|-----|
| **query_wait_timeout** | 80 sec | Long-running or queued queries can hit this and fail with timeouts |
| **api_max_request_duration** | 10 sec | Auth API requests timeout at 10s |

**Impact:** If the DB is under load or queries are slow, clients (including GitHub CI) may see timeouts. 522 from Cloudflare usually means the origin did not respond in time.

### LIKELY CAUSE – 522 from GitHub Runners

Your workflow states: *"Supabase returns 522 from GitHub runners (network unreachable)"*.

**522 = Connection timed out (Cloudflare):** Cloudflare could not get a response from the origin (Supabase) within its timeout.

**Possible causes:**
1. **Network path:** GitHub runners (often in `us-east` or `eu`) → Supabase `us-west-2` may have higher latency or intermittent issues.
2. **Supabase cold starts:** Free-tier or paused projects can have slow first connections.
3. **Pool exhaustion:** With `db_max_pool_size: 10` and `query_wait_timeout: 80`, a burst of connections could queue and time out.
4. **Supabase edge/Cloudflare:** Supabase uses edge infrastructure; timeouts between edge and `us-west-2` can produce 522.

**Mitigations:**
- Keep `continue-on-error: true` for db audit in CI (already done).
- Run `npm run test:db-audit` locally for DB checks.
- Consider retries with backoff for Supabase calls from runners.
- Check [Supabase Status](https://status.supabase.com) during incidents.

---

## 6. Structured Summary (JSON-friendly)

```json
{
  "project": {
    "id": "mrptukahxloqpdqiaxkb",
    "name": "Lords Gym",
    "region": "us-west-2",
    "status": "ACTIVE_HEALTHY"
  },
  "auth": {
    "site_url": "http://localhost:3000",
    "uri_allow_list": "",
    "api_max_request_duration": 10,
    "db_max_pool_size": 10,
    "external_email_enabled": true
  },
  "network": {
    "restrictions": "none",
    "dbAllowedCidrs": ["0.0.0.0/0"],
    "dbAllowedCidrsV6": ["::/0"]
  },
  "database": {
    "pool_mode": "transaction",
    "query_wait_timeout": 80,
    "server_idle_timeout": 600,
    "server_lifetime": 3600
  },
  "misconfigurations": [
    {
      "severity": "high",
      "item": "site_url",
      "current": "http://localhost:3000",
      "recommended": "https://lords-gym.pages.dev or https://lordsgymoutreach.com"
    },
    {
      "severity": "high",
      "item": "uri_allow_list",
      "current": "empty",
      "recommended": "Add https://lords-gym.pages.dev/**, https://lordsgymoutreach.com/**"
    }
  ],
  "522_risk_factors": [
    "GitHub runner → Supabase us-west-2 network path",
    "query_wait_timeout 80s under load",
    "Cold start / free tier latency"
  ]
}
```

---

## 7. Recommended Actions

1. **Auth URL config** — Fixed via script:
   ```bash
   npm run fix:supabase-auth-urls
   ```
   Sets site_url to `https://lords-gym.pages.dev` and adds production redirect URLs.

2. **Keep CI workaround:** Continue skipping db audit in GitHub Actions; run it locally.

3. **Monitor:** Use [Supabase Status](https://status.supabase.com) and project metrics if 522 or timeouts persist.
