# Release Checklist

## Build gate

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run build:prod` succeeds
- [ ] `npm run preview` — smoke test complete playthrough

## Configuration

- [ ] `.env.production` reviewed (analytics off unless ready)
- [ ] Server `AUTH_SECRET` rotated (not dev default)
- [ ] `CORS_ORIGIN` matches production URL
- [ ] `DATA_DIR` persistent volume configured

## Content

- [ ] All levels in `manifest.json` load without validation errors
- [ ] Star thresholds playtested per level

## Performance

- [ ] Lighthouse performance ≥ 80 on mid-tier mobile
- [ ] Phaser holds 60 FPS on target devices
- [ ] Bundle chunks reviewed (`npm run analyze`)

## Security

- [ ] No secrets in client env (only `VITE_*` public vars)
- [ ] Save validation enabled server-side
- [ ] HTTPS enforced in production

## Deployment

- [ ] Static assets uploaded with correct cache headers
- [ ] SPA fallback configured
- [ ] `/levels/*` served
- [ ] `/api` proxied to Node service
- [ ] Health check monitored

## Post-release

- [ ] Crash endpoint receiving errors (if enabled)
- [ ] Analytics funnel verified (if enabled)
- [ ] Rollback plan documented (previous `dist/` tag)

## Version bump

- [ ] `package.json` version updated
- [ ] Changelog entry added
