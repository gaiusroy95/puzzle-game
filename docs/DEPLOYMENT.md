# Deployment Guide

## Prerequisites

- Node.js 20+
- `npm run build:prod` passes locally

## Environment files

| File | Use |
|------|-----|
| `.env.development` | Local Vite (optional) |
| `.env.production` | Client production build |
| `.env` | Server (`DATA_DIR`, `AUTH_SECRET`, `CORS_ORIGIN`) |

## 1. Static hosting (SPA + levels)

**Build:**

```bash
npm run build:client
# or: ./scripts/deploy-static.sh
```

**Deploy `dist/`** to Netlify, Cloudflare Pages, GitHub Pages, or S3.

**Required routing:**

| Path | Behavior |
|------|----------|
| `/*` | `index.html` (SPA fallback) |
| `/levels/*` | Static JSON from `public/levels` |
| `/api/*` | Proxy to Node server (see below) |

**Netlify** `_redirects`:

```
/levels/*  /levels/:splat  200
/api/*     https://api.yourdomain.com/api/:splat  200
/*         /index.html  200
```

**Vercel** — use repo root `vercel.json` (client-only build). In the project dashboard, set environment variables from `.env.production` (`VITE_*` only). Do not use `npm run build`; that compiles the Express server, which Vercel does not run. Optional: add a rewrite/proxy for `/api` if the API is hosted elsewhere.

## 2. CDN deployment

1. Upload `dist/assets/*` with long cache: `Cache-Control: public, max-age=31536000, immutable`
2. Upload `index.html` with `max-age=0, must-revalidate`
3. Upload `dist/levels/*` or sync `public/levels` separately
4. Enable Brotli/gzip at edge

## 3. Cloud deployment (full stack)

### Client + API (single VM)

```bash
npm run build
NODE_ENV=production PORT=3001 node dist/server/index.js
```

Serve `dist/` via nginx:

```nginx
location / {
  root /var/www/puzzle-game/dist;
  try_files $uri $uri/ /index.html;
}
location /api {
  proxy_pass http://127.0.0.1:3001;
}
```

### Docker (outline)

- Stage 1: `npm run build`
- Stage 2: `node dist/server/index.js` + copy `dist/` for static middleware (add if needed)

### Environment (production)

```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourgame.com
DATA_DIR=/var/data/puzzle-game
AUTH_SECRET=<strong-random-secret>
ENABLE_CLOUD_SAVES=true
```

## Analytics / crashes

Set in production client env:

```env
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_ENDPOINT=https://collector.example/v1/events
VITE_CRASH_REPORT_ENDPOINT=https://collector.example/v1/crashes
```

## Post-deploy smoke test

1. Load `/` — menu appears
2. `GET /api/health` → `{ ok: true }`
3. Play level 1 → win → progress saved
4. Hard refresh → progress persists
