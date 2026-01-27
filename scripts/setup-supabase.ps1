# Supabase Setup Script for Windows
# This script helps automate Supabase setup tasks

Write-Host "🚀 Starting Supabase setup..." -ForegroundColor Green
Write-Host ""

# Load environment variables from .env.local
$envFile = Join-Path $PSScriptRoot "..\.env.local"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "✅ Loaded environment variables from .env.local" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local not found. Make sure it exists with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY" -ForegroundColor Yellow
}

$supabaseUrl = $env:VITE_SUPABASE_URL
$supabaseAnonKey = $env:VITE_SUPABASE_ANON_KEY

if (-not $supabaseUrl -or -not $supabaseAnonKey) {
    Write-Host "❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host ("=" * 70)
Write-Host "📋 SETUP INSTRUCTIONS"
Write-Host ("=" * 70)
Write-Host ""

Write-Host "1️⃣  RUN DATABASE MIGRATION" -ForegroundColor Cyan
Write-Host "   - Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/sql/new"
Write-Host "   - Copy the contents of: supabase\migrations\003_complete_schema.sql"
Write-Host "   - Paste into SQL Editor"
Write-Host "   - Click Run or press Ctrl+Enter"
Write-Host ""

Write-Host "2️⃣  CREATE STORAGE BUCKET" -ForegroundColor Cyan
Write-Host "   - Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/storage/buckets"
Write-Host "   - Click New bucket"
Write-Host "   - Name: media"
Write-Host "   - Check Public bucket"
Write-Host "   - Click Create bucket"
Write-Host ""

Write-Host "3️⃣  CREATE ADMIN USER" -ForegroundColor Cyan
Write-Host "   - Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/auth/users"
Write-Host "   - Click Add user then Create new user"
Write-Host "   - Enter email and password"
Write-Host "   - Click Advanced and add metadata:"
Write-Host '     {"role": "admin"}'
Write-Host "   - Click Create user"
Write-Host ""

Write-Host "4️⃣  VERIFY SETUP" -ForegroundColor Cyan
Write-Host "   - Run: npm run dev"
Write-Host "   - Navigate to /admin"
Write-Host "   - Log in with your admin user"
Write-Host "   - Verify data loads from Supabase"
Write-Host ""

Write-Host ("=" * 70)
Write-Host ""

# Try to verify connection
Write-Host "🔍 Verifying Supabase connection..." -ForegroundColor Yellow
try {
    $headers = @{
        "apikey" = $supabaseAnonKey
        "Authorization" = "Bearer $supabaseAnonKey"
        "Content-Type" = "application/json"
    }
    
    # Try to access a table endpoint to verify connection
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/settings?select=id&limit=1" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "✅ Successfully connected to Supabase" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✅ Connected to Supabase (tables not created yet - this is expected)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Could not verify connection: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "   This is okay - you can still proceed with the manual steps above" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "💡 TIP: After running the migration, check the Tables section in your" -ForegroundColor Cyan
Write-Host "   Supabase dashboard to verify all 14 tables were created." -ForegroundColor Cyan
Write-Host ""
