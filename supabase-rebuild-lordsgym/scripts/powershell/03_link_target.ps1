# Link Supabase CLI to target project
# Run from: LordsGym root (or ensure supabase config is there)
# Requires: $env:TARGET_PROJECT_REF

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkspaceRoot = Resolve-Path (Join-Path $ScriptDir "../..")
$LordsGymRoot = Resolve-Path (Join-Path $WorkspaceRoot "../")

$Ref = $env:TARGET_PROJECT_REF
if (-not $Ref) {
    Write-Error "Set TARGET_PROJECT_REF"
    exit 1
}

Push-Location $LordsGymRoot
try {
    npx supabase link --project-ref $Ref
} finally {
    Pop-Location
}
