# Database Backup and Recovery

## Overview

The LordsGym database is managed via Supabase. Migrations in `supabase/migrations/` are the source of truth for schema. This doc covers backup, restore, and recovery procedures.

## Point-in-Time Recovery (PITR)

**Supabase Pro+** offers automatic PITR. Enable it in:

Dashboard → Project Settings → Database → Point in time recovery

PITR allows restoring to any point within the retention window (typically 7–30 days depending on plan).

## Manual Backup

### Full schema dump

```bash
# Requires direct DB URL (Database Settings → Connection string)
supabase db dump -f backup_schema.sql --db-url "$DATABASE_URL"
```

### Schema + data (full backup)

```bash
pg_dump "$DATABASE_URL" -F c -f lords_gym_backup.dump
```

Restore:

```bash
pg_restore -d "$DATABASE_URL" --clean --if-exists lords_gym_backup.dump
```

## Recovery from migrations

If the database is lost, schema can be rebuilt from migrations:

```bash
# Link project first
supabase link --project-ref YOUR_PROJECT_REF

# Reset and apply all migrations (destroys existing data)
supabase db reset
```

Use `supabase db push` to apply only new migrations without resetting:

```bash
npm run db:push
```

## Runbook

| Scenario | Action |
|----------|--------|
| Apply new migrations | `npm run db:push` |
| Test migrations locally | `supabase start` then `supabase db reset` |
| Schema drift check | `supabase db diff` |
| Restore from PITR | Dashboard → Database → Backups → Restore to point in time |
| Full restore from dump | `pg_restore -d "$DATABASE_URL" backup.dump` |

## Related

- [DATABASE_BRANCHING_STRATEGY.md](../DATABASE_BRANCHING_STRATEGY.md) — Dev/staging/prod database strategy
- [.cursor/rules/supabase-db.mdc](../.cursor/rules/supabase-db.mdc) — Migration and hardening rules
