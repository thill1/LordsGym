# Apply migrations to linked target project
# Run from: supabase-rebuild-lordsgym/scripts/powershell
# Requires: LordsGym .env.local with SUPABASE_ACCESS_TOKEN (or --env-file)
# Uses: npm run db:push from LordsGym root

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkspaceRoot = Resolve-Path (Join-Path $ScriptDir "../..")
$LordsGymRoot = Resolve-Path (Join-Path $WorkspaceRoot "../")
$EnvPath = Join-Path $LordsGymRoot ".env.local"

Push-Location $LordsGymRoot
try {
    if (Test-Path $EnvPath) {
        node --env-file=.env.local scripts/supabase-db-push.mjs
    } else {
        npm run db:push
    }
} finally {
    Pop-Location
}
