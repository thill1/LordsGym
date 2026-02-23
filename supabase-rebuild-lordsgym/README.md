# Supabase Rebuild — Lord's Gym

Zero-mistake migration of Lord's Gym Supabase project to a new West Coast project.

## Operating Mode

1. **Generate** — All scripts and checklists created before execution
2. **Review** — User reviews README, checklists, and SQL before running
3. **Execute** — Commands run only after explicit approval
4. **Validate** — Check after every step
5. **Log** — Every command and output saved to `logs/`

## Run Order

### Phase 1: Inventory (Read-Only)

Export schema and table counts from the **source** project. No writes to source.

| Step | Script | Output |
|------|--------|--------|
| 1.1 | `scripts/powershell/01_backup_env.ps1` | `exports/.env.local.YYYYMMDD-HHmmss.backup` |
| 1.2 | `scripts/powershell/02_export_inventory.ps1` | `exports/inventory/` |
| 1.3 | `scripts/node/02_export_schema.js` | `exports/schema-YYYYMMDD.sql` |

**Validation:** Verify `exports/inventory/` and `exports/counts/` contain expected files.

---

### Phase 2: Create Target Project

| Step | Action | Notes |
|------|--------|-------|
| 2.1 | Create new Supabase project via [Dashboard](https://supabase.com/dashboard) | Name: Lords Gym, Region: us-west-2 (West Coast) |
| 2.2 | Save project ref, URL, anon key, service_role key | Add to `.env` or `.env.local` |
| 2.3 | Run `scripts/powershell/03_link_target.ps1` | Links Supabase CLI to target |

**Validation:** `npx supabase migration list` shows no remote migrations yet.

---

### Phase 3: Apply Migrations

| Step | Script | Notes |
|------|--------|-------|
| 3.1 | `scripts/powershell/04_db_push.ps1` | Runs from LordsGym root; requires `SUPABASE_ACCESS_TOKEN` |

**Validation:** `npx supabase migration list` shows all migrations applied.

---

### Phase 4: Provision Storage + Auth

| Step | Script / Action | Notes |
|------|-----------------|-------|
| 4.1 | `scripts/node/01_complete_supabase.js` | Creates media bucket, settings row, admin user |
| 4.2 | Auth → URL Configuration | Set Site URL, Redirect URLs (see [checklists/cutover.md](checklists/cutover.md)) |
| 4.3 | Auth → Users | Verify admin user; create if missing |

**Validation:** Media bucket exists; Admin login works.

---

### Phase 5: Data Export/Import (If Source Reachable)

If the source database is reachable:

| Step | Action |
|------|--------|
| 5.1 | `pg_dump "$SOURCE_DB_URL" -F c -f exports/source_backup.dump` |
| 5.2 | `pg_restore -d "$TARGET_DB_URL" --data-only --disable-triggers exports/source_backup.dump` (schema already applied) |

If source is unreachable: Schema-only rebuild; re-enter data via Admin UI.

---

### Phase 6: Validation

| Step | Script | Output |
|------|--------|--------|
| 6.1 | `scripts/powershell/05_run_validation.ps1` | `exports/diffs/` |
| 6.2 | Run `sql/validation/rls_audit.sql` | Review RLS policies |
| 6.3 | Manual: Verify media bucket, Auth URLs | See cutover checklist |

**Validation:** All checks green before cutover.

---

### Phase 7: Cutover

Follow [checklists/cutover.md](checklists/cutover.md).

---

### Phase 8: Post-Cutover Verification

- Smoke test: Admin login, Store, Calendar
- Monitor logs; verify Auth redirects
- Update Edge Function secrets if applicable

---

## Rollback

See [checklists/rollback.md](checklists/rollback.md).

---

## File Structure

```
supabase-rebuild-lordsgym/
├── docs/              Migration notes, decisions
├── logs/              Timestamped command outputs
├── sql/
│   ├── inventory/     Schema/count export scripts
│   ├── migrations/    Copy from LordsGym/supabase/migrations/
│   ├── validation/    Post-migration checks
│   └── manual/        One-off SQL
├── scripts/
│   ├── bash/
│   ├── powershell/
│   └── node/
├── exports/
│   ├── inventory/
│   ├── counts/
│   └── diffs/
├── checklists/
├── .env.example
└── README.md
```

---

## References

- [SUPABASE_BACKUP_DATABASE.md](../docs/SUPABASE_BACKUP_DATABASE.md) — Backup project creation
- [checklists/migration_execution_plan.md](checklists/migration_execution_plan.md) — Numbered steps with approval gates
