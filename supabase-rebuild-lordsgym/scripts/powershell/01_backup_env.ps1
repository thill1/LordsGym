# Backup .env.local before any step that may overwrite it
# Run from: supabase-rebuild-lordsgym/scripts/powershell
# Output: exports/.env.local.YYYYMMDD-HHmmss.backup

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkspaceRoot = Resolve-Path (Join-Path $ScriptDir "../..")
$LordsGymRoot = Resolve-Path (Join-Path $WorkspaceRoot "../")
$EnvPath = Join-Path $LordsGymRoot ".env.local"
$ExportsDir = Join-Path $WorkspaceRoot "exports"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupPath = Join-Path $ExportsDir ".env.local.$Timestamp.backup"

if (-not (Test-Path $EnvPath)) {
    Write-Warning ".env.local not found at $EnvPath"
    Write-Host "Nothing to backup. Create .env.local in LordsGym root first."
    exit 0
}

if (-not (Test-Path $ExportsDir)) {
    New-Item -ItemType Directory -Path $ExportsDir -Force | Out-Null
}

Copy-Item $EnvPath $BackupPath -Force
Write-Host "Backed up .env.local to $BackupPath"
