# Build and prepare dist/ for static hosting (Netlify, S3, GitHub Pages, etc.)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "Building production client..."
npm run build:client

Write-Host ""
Write-Host "Static assets ready in: dist/"
Write-Host "Upload contents of dist/ to your CDN or static host."
Write-Host "Ensure /levels/* and /api proxy rules are configured."
