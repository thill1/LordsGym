# Database Branching Strategy Guide

## Current State

You currently have:
- ✅ SQL migration files in `supabase/migrations/`
- ❌ Manual migration execution (copy/paste in SQL Editor)
- ❌ No Git branching strategy
- ❌ Single Supabase project (no dev/staging separation)

## Recommended Strategy: Hybrid Approach

**Use BOTH:**
1. **Git branching** → Manage code changes and migrations
2. **Separate Supabase projects** → Dev, Staging, Production databases
3. **Supabase CLI** → Automated migration management (optional but recommended)
4. **Supabase Branching** → For preview/feature branches (optional, later)

---

## Option 1: Separate Supabase Projects (Recommended for Now) ⭐

This is the **safest and simplest** approach for your current situation.

### Architecture

```
┌─────────────────┐
│   GitHub Repo   │
│                 │
│  ┌───────────┐  │
│  │   main    │──┼──→ Production Supabase Project
│  └───────────┘  │
│                 │
│  ┌───────────┐  │
│  │  develop  │──┼──→ Staging Supabase Project
│  └───────────┘  │
│                 │
│  ┌───────────┐  │
│  │  feature  │──┼──→ Development Supabase Project (or local)
│  └───────────┘  │
└─────────────────┘
```

### Benefits

- ✅ **Clear separation**: Dev can never break production
- ✅ **Safe testing**: Test migrations on staging before production
- ✅ **Simple**: No new Supabase features needed (just create projects)
- ✅ **Cost-effective**: Free tier for dev/staging
- ✅ **Familiar**: Standard industry practice

### Setup Steps

#### Step 1: Create Supabase Projects

1. **Production Project** (you already have this)
   - Project name: `lords-gym-prod`
   - Keep your existing project

2. **Staging Project** (create new)
   - Go to https://app.supabase.com
   - Click "New Project"
   - Name: `lords-gym-staging`
   - Copy production schema (see below)

3. **Development Project** (optional, or use local)
   - Name: `lords-gym-dev`
   - Or use Supabase CLI locally

#### Step 2: Copy Production Schema to Staging

In your **staging** project SQL Editor, run:
- All migrations from `supabase/migrations/001_initial_schema.sql`
- All migrations from `supabase/migrations/002_recurring_exceptions.sql`

Or use the Supabase CLI (recommended):
```bash
# Export production schema
supabase db dump -f staging_schema.sql --db-url $PROD_DB_URL

# Import to staging
supabase db reset --db-url $STAGING_DB_URL --file staging_schema.sql
```

#### Step 3: Set Up Environment Variables

Create `.env` files per environment:

**.env.production**
```env
VITE_SUPABASE_URL=https://xxxxx-prod.supabase.co
VITE_SUPABASE_ANON_KEY=prod_anon_key_here
```

**.env.staging**
```env
VITE_SUPABASE_URL=https://xxxxx-staging.supabase.co
VITE_SUPABASE_ANON_KEY=staging_anon_key_here
```

**.env.local** (development)
```env
VITE_SUPABASE_URL=https://xxxxx-dev.supabase.co
VITE_SUPABASE_ANON_KEY=dev_anon_key_here
```

#### Step 4: Git Branching Strategy

```
main (production)
  └── develop (staging)
       └── feature/new-calendar-feature
       └── feature/update-products
```

**Workflow:**
1. Create feature branch from `develop`
2. Make code + migration changes
3. Test locally with dev database
4. Merge to `develop` → auto-deploy to staging
5. Test on staging
6. Merge `develop` → `main` → deploy to production

#### Step 5: Migration Workflow

**For each migration:**
1. Create migration file: `supabase/migrations/003_my_change.sql`
2. Test locally or on dev project
3. Commit to feature branch
4. Merge to `develop` → run migration on staging
5. Merge to `main` → run migration on production

---

## Option 2: Neon Postgres - BEST Database Branching Alternative ⭐⭐⭐⭐⭐

**Neon** is a serverless PostgreSQL database with **excellent branching** built-in. It's the best alternative to Supabase if you want proper database branching.

### Why Neon for Branching?

- ✅ **Instant branching** - Create branches in seconds (like Git)
- ✅ **Mature & stable** - Production-ready, widely used
- ✅ **PostgreSQL** - Same database type as Supabase (easy migration)
- ✅ **Git-like workflow** - Branch, test, merge database changes
- ✅ **Free tier** - 0.5GB storage, unlimited projects
- ✅ **No beta issues** - Unlike Supabase branching

### How Neon Branching Works

```
Production Database (main branch)
  ├─→ Feature Branch (instant copy for testing)
  ├─→ Staging Branch (long-lived testing)
  └─→ Dev Branch (experimental changes)
```

**Each branch has:**
- ✅ Isolated schema
- ✅ Separate data (or can share)
- ✅ Independent migrations
- ✅ Own connection string

### Migration from Supabase to Neon

Since both use PostgreSQL, migration is straightforward:

1. **Export from Supabase:**
```bash
# Get connection string from Supabase dashboard
pg_dump "postgresql://..." > supabase_backup.sql
```

2. **Import to Neon:**
```bash
# Create Neon project at https://neon.tech
# Get connection string from Neon dashboard
psql "postgresql://..." < supabase_backup.sql
```

3. **Update your code:**
```typescript
// lib/supabase.ts → lib/neon.ts (or keep using Supabase client with Neon)
import { createClient } from '@supabase/supabase-js';

// Neon provides Postgres connection string
// You can use Postgres.js or keep Supabase client (works with any Postgres)
const supabase = createClient(neonUrl, neonKey);
```

### Neon Branching Setup

1. **Sign up at Neon:** https://neon.tech (free tier available)

2. **Create production database** (main branch)

3. **Create branches:**
```bash
# Using Neon CLI
neon branches create staging
neon branches create feature/new-feature

# Or via dashboard - just click "Create Branch"
```

4. **Branch automatically gets:**
   - Copy of schema
   - Fresh data (or optional: copy of production data)
   - Own connection string

5. **Workflow:**
```bash
# Create feature branch
git checkout -b feature/add-column
neon branches create feature/add-column

# Make schema changes on branch
# Test migrations on branch

# Merge to staging
git checkout develop
neon branches merge feature/add-column staging

# Merge to production
git checkout main
neon branches merge staging main
```

### Cost Comparison

| Feature | Supabase Branching | Neon Branching | Separate Supabase Projects |
|---------|-------------------|----------------|---------------------------|
| **Branching** | ⚠️ Beta, rough edges | ✅ Production-ready | ❌ Manual setup |
| **Cost** | Free tier | Free tier (0.5GB) | Free tier per project |
| **Speed** | Slow setup | Instant branches | Manual copying |
| **Stability** | ⚠️ Beta issues | ✅ Stable | ✅ Stable |

### Trade-offs: Neon vs Supabase

**Neon provides:**
- ✅ Excellent branching
- ✅ PostgreSQL database
- ✅ Free tier

**Neon does NOT provide:**
- ❌ Built-in auth (need Clerk, Auth0, or custom)
- ❌ Built-in storage (need S3, Cloudflare R2)
- ❌ Edge functions (need Vercel, Cloudflare Workers)
- ❌ Auto-generated API (need to build or use PostgREST)

**Recommendation:**
- If you **need branching** → Use **Neon** for database, add auth/storage separately
- If you **want everything included** → Use **separate Supabase projects** (simpler)
- If you **want best of both** → Use **Neon for branching** + **Supabase for auth/storage**

---

## Option 3: Supabase Branching (NOT Recommended - Beta Issues)

⚠️ **You mentioned you haven't heard good things - you're right!**

### Known Issues

- ❌ Still in beta with stability issues
- ❌ Migration history conflicts
- ❌ Slow branch creation
- ❌ Not recommended for production workflows
- ❌ Manual dashboard changes don't sync well

### When It Might Work

- ✅ Very early-stage projects
- ✅ Testing preview environments only
- ✅ Okay with beta instability

**Better Alternative:** Use Neon for branching, or separate Supabase projects

---

## Recommended Workflows

### Workflow 1: Neon Branching (Best for Database Branching)

```
┌─────────────────────────────────────────────┐
│  Feature Branch (Git)                       │
│  └─→ Neon Branch (instant DB copy)          │
│      Test migrations on isolated DB         │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  Develop Branch (Git)                       │
│  └─→ Neon Staging Branch                    │
│      Full integration testing               │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  Main Branch (Git)                          │
│  └─→ Neon Production Branch                 │
│      Live production database               │
└─────────────────────────────────────────────┘
```

**Benefits:**
- ✅ Instant database branches
- ✅ No manual setup
- ✅ Git-like database workflow
- ✅ Test migrations safely

---

### Workflow 2: Separate Supabase Projects (Simplest, Most Reliable)

```
┌─────────────────────────────────────────────┐
│  Feature Branch (Git)                       │
│  └─→ Dev Supabase Project (or local)        │
│      Test migrations manually               │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  Develop Branch (Git)                       │
│  └─→ Staging Supabase Project               │
│      Full integration testing               │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  Main Branch (Git)                          │
│  └─→ Production Supabase Project            │
│      Live production database               │
└─────────────────────────────────────────────┘
```

**Benefits:**
- ✅ Keep all Supabase features (auth, storage, etc.)
- ✅ No learning curve
- ✅ Most stable option
- ✅ Simple setup

---

## Migration Management: Manual vs CLI

### Current: Manual (SQL Editor)

**Pros:**
- ✅ Simple, no setup needed
- ✅ Works immediately

**Cons:**
- ❌ Easy to forget to run migrations
- ❌ No version tracking
- ❌ Risk of manual changes not being in migrations
- ❌ Hard to test before production

### Recommended: Supabase CLI

**Setup:**
```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref
```

**Create migration:**
```bash
# Creates new migration file
supabase migration new add_new_column

# Edit the generated file in supabase/migrations/
```

**Run migrations:**
```bash
# Push migrations to linked project
supabase db push

# Reset database (dev only!)
supabase db reset
```

**Benefits:**
- ✅ Version controlled migrations
- ✅ Test locally before pushing
- ✅ Automatic migration tracking
- ✅ Can't forget migrations

---

## Implementation Plan

### Phase 1: Git Branching (Do This First)

1. ✅ Create `develop` branch
2. ✅ Set up branch protection rules (GitHub)
3. ✅ Update deployment workflow to use branches

### Phase 2: Separate Databases

1. ✅ Create staging Supabase project
2. ✅ Copy production schema to staging
3. ✅ Set up environment variables
4. ✅ Test staging deployment

### Phase 3: Migration Automation

1. ✅ Install Supabase CLI
2. ✅ Migrate to CLI-based migrations
3. ✅ Set up local development

### Phase 4: Advanced (Optional)

1. ⏳ Enable Supabase Branching for previews
2. ⏳ Set up CI/CD for automatic migrations

---

## Quick Start: Git Branching Only

If you want to start simple, just implement Git branching first:

```bash
# Create develop branch
git checkout -b develop
git push -u origin develop

# Create feature branch
git checkout -b feature/new-feature
# Make changes...
git commit -m "Add new feature"
git push -u origin feature/new-feature

# When ready, merge to develop
git checkout develop
git merge feature/new-feature
git push

# When ready for production
git checkout main
git merge develop
git push
```

You can still manually run migrations, but at least code is organized in branches.

---

## Decision Matrix: Which Approach?

| Scenario | Recommended Approach |
|----------|---------------------|
| **Want best database branching** | **Neon Postgres** (instant branches) |
| **Want simplest setup** | **Separate Supabase projects** (no learning curve) |
| **Just starting out** | Git branching only (code first, DB later) |
| **Production has live data** | Separate Supabase projects (safest) |
| **Need fast feature testing** | Neon branching (instant branches) |
| **Want all-in-one solution** | Separate Supabase projects (auth + storage included) |
| **Large team, many features** | Neon branching (each dev gets own branch) |

### Quick Comparison

| Solution | Branching Quality | Setup Time | Cost | Best For |
|----------|------------------|------------|------|----------|
| **Neon Postgres** | ⭐⭐⭐⭐⭐ Excellent | 30 min | Free tier | Want proper branching |
| **Separate Supabase Projects** | ⭐⭐⭐ Manual | 15 min | Free tier | Want simplicity + all features |
| **Supabase Branching** | ⭐⭐ Beta issues | 20 min | Free tier | ❌ Not recommended |
| **Local Supabase CLI** | ⭐⭐⭐ Good | 10 min | Free | Local development only |

---

## What About Vercel, Netlify, Acorn?

**Important:** These are **deployment platforms**, not database providers.

- ❌ **Vercel** - Frontend hosting, serverless functions (doesn't provide database branching)
- ❌ **Netlify** - Frontend hosting, serverless functions (doesn't provide database branching)
- ❌ **Acorn** - Container deployment platform (doesn't provide database branching)

**They can work WITH:**
- ✅ Neon (for database branching)
- ✅ Supabase (separate projects)
- ✅ Any database provider

**Typical setup:**
```
GitHub → Vercel/Netlify (deploys frontend)
       → Neon/Supabase (database)
```

Your **frontend code** deploys to Vercel/Netlify.
Your **database** needs a separate provider (Neon, Supabase, etc.).

---

## Backup and Restore

See [docs/BACKUP_RESTORE.md](docs/BACKUP_RESTORE.md) for backup, restore, and PITR procedures.

---

## Next Steps

### Recommended Path:

1. **Start Simple:** Set up Git branching (5 minutes)
2. **Choose Database Strategy:**
   - **Want branching?** → Migrate to **Neon Postgres**
   - **Want simple?** → Use **separate Supabase projects**
3. **Automate:** Set up CI/CD for deployments (1 hour)

### I Can Help You:

- ✅ Set up Git branching structure
- ✅ Create migration guide: Supabase → Neon
- ✅ Set up separate Supabase projects (dev/staging/prod)
- ✅ Create GitHub Actions workflows for deployments
- ✅ Configure environment variables per environment
- ✅ Set up Supabase CLI for local development

**Which would you like to do first?**
