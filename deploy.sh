#!/bin/bash
# Quick Deploy Script for Lords Gym to Cloudflare Pages
# Run this after setting up Cloudflare Pages connection

echo "🚀 Lords Gym Cloudflare Deployment Helper"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this from the LordsGym directory"
    exit 1
fi

echo "📦 Building site..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""
echo "📋 Cloudflare Pages Setup Instructions:"
echo "========================================"
echo ""
echo "1. Go to: https://dash.cloudflare.com/pages"
echo ""
echo "2. Click 'Create a project' → 'Connect to Git'"
echo ""
echo "3. Select the 'LordsGym' repository"
echo ""
echo "4. Configure build settings:"
echo "   - Project name: lords-gym-auburn"
echo "   - Production branch: main"
echo "   - Build command: npm run build"
echo "   - Build output directory: dist"
echo ""
echo "5. Environment variables (optional for now):"
echo "   - VITE_SUPABASE_URL: (leave blank for static site)"
echo "   - VITE_SUPABASE_ANON_KEY: (leave blank for static site)"
echo ""
echo "6. Click 'Save and Deploy'"
echo ""
echo "🎉 Your site will be live at: https://lords-gym-auburn.pages.dev"
echo ""
echo "💡 Want a custom domain? Add it in Cloudflare Pages → Custom domains"
echo ""
