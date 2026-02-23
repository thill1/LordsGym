# Migration Execution Plan — Lord's Gym

Numbered steps with approval checkpoints. **Do not execute destructive commands without explicit approval.**

---

## Phase 1: Inventory (Read-Only)

| # | Step | Command | Expected Output |
|---|------|---------|-----------------|
| 1.1 | Backup .env | `.\scripts\powershell\01_backup_env.ps1` | File in exports/ |
| 1.2 | Export inventory | `.\scripts\powershell\02_export_inventory.ps1` | Files in exports/inventory/ |
| 1.3 | Export schema | `node scripts/node/02_export_schema.js` | exports/schema-YYYYMMDD.sql |

**Approval:** Review outputs. Proceed to Phase 2.

---

## Phase 2: Create Target Project

| # | Step | Command | Expected Output |
|---|------|---------|-----------------|
| 2.1 | Create project | Manual: Supabase Dashboard → New project | Project ref, URL, keys |
| 2.2 | Set env | Add TARGET_PROJECT_REF, VITE_SUPABASE_URL, keys to .env | — |
| 2.3 | Link CLI | `.\scripts\powershell\03_link_target.ps1` | "Finished supabase link" |

**Approval:** Confirm link works. Proceed to Phase 3.

---

## Phase 3: Apply Migrations

| # | Step | Command | Expected Output |
|---|------|---------|-----------------|
| 3.1 | db push | `.\scripts\powershell\04_db_push.ps1` | "Finished supabase db push" |

**Approval:** Run validation (Phase 6.1) before cutover.

---

## Phase 4: Provision Storage + Auth

| # | Step | Command | Expected Output |
|---|------|---------|-----------------|
| 4.1 | Complete setup | `node scripts/node/01_complete_supabase.js` | Media bucket, settings, admin created |
| 4.2 | Auth config | Manual: Dashboard → Auth → URL Configuration | — |

**Approval:** Verify Admin login. Proceed to Phase 6.

---

## Phase 5: Data (Optional)

| # | Step | Command | Expected Output |
|---|------|---------|-----------------|
| 5.1 | pg_dump source | `pg_dump "$SOURCE_DB_URL" -F c -f exports/source_backup.dump` | Dump file |
| 5.2 | pg_restore target | `pg_restore -d "$TARGET_DB_URL" --data-only --disable-triggers exports/source_backup.dump` | Data loaded |

**Approval:** Explicit approval required for pg_restore. Skip if source unreachable.

---

## Phase 6: Validation

| # | Step | Command | Expected Output |
|---|------|---------|-----------------|
| 6.1 | Run validation | `.\scripts\powershell\05_run_validation.ps1` | exports/diffs/ |
| 6.2 | RLS audit | `psql "$TARGET_DB_URL" -f sql/validation/rls_audit.sql` | Review policies |
| 6.3 | Storage check | `psql "$TARGET_DB_URL" -f sql/validation/05_storage_buckets.sql` | media bucket OK |

**Approval:** All green. Proceed to cutover.

---

## Phase 7: Cutover

Follow [cutover.md](cutover.md).

**Sign-off before cutover:** _______________________ Date: ___________
