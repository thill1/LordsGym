# Complete Supabase Setup via Chrome Automation
# This script uses Chrome DevTools Protocol to complete Supabase setup tasks

Write-Host "🚀 Starting Supabase setup via Chrome automation..." -ForegroundColor Green
Write-Host ""

# Check if Chrome is running
$chromeProcesses = Get-Process chrome -ErrorAction SilentlyContinue
if (-not $chromeProcesses) {
    Write-Host "❌ Chrome is not running. Please open Chrome first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Chrome is running" -ForegroundColor Green
Write-Host ""

# Note: Chrome DevTools Protocol requires Chrome to be launched with --remote-debugging-port
# Since we can't access the authenticated session, we'll use API verification instead

Write-Host "📋 Since Chrome DevTools connects to a separate instance without your authenticated session," -ForegroundColor Yellow
Write-Host "   we'll verify completion via API after you complete the manual steps." -ForegroundColor Yellow
Write-Host ""

# Load environment variables
$envFile = Join-Path $PSScriptRoot "..\.env.local"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

$supabaseUrl = $env:VITE_SUPABASE_URL
$supabaseAnonKey = $env:VITE_SUPABASE_ANON_KEY

if (-not $supabaseUrl -or -not $supabaseAnonKey) {
    Write-Host "❌ Error: Environment variables not set" -ForegroundColor Red
    exit 1
}

Write-Host "🔍 Verifying current setup status..." -ForegroundColor Cyan
Write-Host ""

# Verify via API
$headers = @{
    "apikey" = $supabaseAnonKey
    "Authorization" = "Bearer $supabaseAnonKey"
    "Content-Type" = "application/json"
}

# Check storage bucket
try {
    $storageResponse = Invoke-RestMethod -Uri "$supabaseUrl/storage/v1/bucket" -Method GET -Headers $headers -ErrorAction Stop
    $mediaBucket = $storageResponse | Where-Object { $_.name -eq 'media' }
    
    if ($mediaBucket) {
        Write-Host "✅ Storage bucket 'media' exists" -ForegroundColor Green
        Write-Host "   Public: $($mediaBucket.public)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Storage bucket 'media' does not exist" -ForegroundColor Red
        Write-Host "   📝 Action needed: Create bucket manually" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not verify storage bucket: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 To complete setup, please:" -ForegroundColor Cyan
Write-Host "1. Open: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/storage/buckets" -ForegroundColor White
Write-Host "2. Create bucket: media (public)" -ForegroundColor White
Write-Host "3. Open: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/auth/users" -ForegroundColor White
Write-Host "4. Create admin user with metadata: {`"role`": `"admin`"}" -ForegroundColor White
Write-Host ""
Write-Host "Then run: node scripts/complete-supabase-setup.js" -ForegroundColor Cyan
