#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Building production client..."
npm run build:client

echo ""
echo "Static assets ready in: dist/"
echo "Upload dist/ to your static host (S3, Netlify, Cloudflare Pages, etc.)"
