# Run validation SQL against target
# Run from: supabase-rebuild-lordsgym/scripts/powershell
# Requires: $env:TARGET_DB_URL (or $env:DATABASE_URL)
# Output: exports/diffs/

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkspaceRoot = Resolve-Path (Join-Path $ScriptDir "../..")
$SqlDir = Join-Path $WorkspaceRoot "sql/validation"
$ExportsDir = Join-Path $WorkspaceRoot "exports/diffs"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

$DbUrl = $env:TARGET_DB_URL ?? $env:DATABASE_URL
if (-not $DbUrl) {
    Write-Error "Set TARGET_DB_URL or DATABASE_URL"
    exit 1
}

if (-not (Test-Path $ExportsDir)) {
    New-Item -ItemType Directory -Path $ExportsDir -Force | Out-Null
}

$Scripts = @("01_schema_diff", "02_row_counts", "03_rls_enabled", "04_foreign_keys", "05_storage_buckets")
foreach ($Name in $Scripts) {
    $SqlFile = Join-Path $SqlDir "$Name.sql"
    if (Test-Path $SqlFile) {
        $OutFile = Join-Path $ExportsDir "${Name}_$Timestamp.txt"
        Write-Host "Running $Name -> $OutFile"
        psql $DbUrl -f $SqlFile 2>&1 | Out-File -FilePath $OutFile -Encoding utf8
    }
}
Write-Host "Validation complete. Output in $ExportsDir"
