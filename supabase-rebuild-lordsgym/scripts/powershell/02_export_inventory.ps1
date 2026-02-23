# Export inventory (schema, counts, policies, storage) from source or target
# Run from: supabase-rebuild-lordsgym/scripts/powershell
# Requires: $env:SOURCE_DB_URL or $env:TARGET_DB_URL (or $env:DATABASE_URL)
# Load .env from workspace or LordsGym root if needed

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkspaceRoot = Resolve-Path (Join-Path $ScriptDir "../..")
$SqlDir = Join-Path $WorkspaceRoot "sql/inventory"
$ExportsDir = Join-Path $WorkspaceRoot "exports/inventory"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

$DbUrl = $env:TARGET_DB_URL ?? $env:SOURCE_DB_URL ?? $env:DATABASE_URL
if (-not $DbUrl) {
    Write-Error "Set TARGET_DB_URL, SOURCE_DB_URL, or DATABASE_URL"
    exit 1
}

if (-not (Test-Path $ExportsDir)) {
    New-Item -ItemType Directory -Path $ExportsDir -Force | Out-Null
}

$Scripts = @("01_export_schema", "02_table_counts", "03_list_policies", "04_list_storage_buckets")
foreach ($Name in $Scripts) {
    $SqlFile = Join-Path $SqlDir "$Name.sql"
    if (Test-Path $SqlFile) {
        $OutFile = Join-Path $ExportsDir "${Name}_$Timestamp.txt"
        Write-Host "Running $Name -> $OutFile"
        psql $DbUrl -f $SqlFile 2>&1 | Out-File -FilePath $OutFile -Encoding utf8
    }
}
Write-Host "Inventory export complete. Output in $ExportsDir"
