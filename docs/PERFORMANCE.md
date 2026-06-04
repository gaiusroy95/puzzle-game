# Performance Audit & Strategy

## Audit summary (baseline → optimized)

| Area | Issue | Mitigation |
|------|--------|------------|
| Initial load | Phaser + all scenes in main bundle | Dynamic `import()` in `createGame.ts` |
| Canvas resolution | Full DPR on retina (4x pixels) | Cap DPR at 2 (`capDevicePixelRatio`) |
| React | App re-rendered on every bridge event | `GameBridgeListeners` isolated from canvas |
| React | `saveStore` auto-save on any store touch | `subscribeWithSelector` + `shallow` equality |
| React | Resize spam | Debounced viewport updates (150ms) |
| Phaser | Antialiasing cost in prod | Disabled when `import.meta.env.PROD` |
| Memory | StrictMode double-mount in dev | Production build skips `StrictMode` |

## 60 FPS targets

- Phaser `fps.target: 60` with `smoothStep`
- Puzzle logic runs on input events, not per-frame React updates
- Grid views update only on snapshot change (existing `PuzzleViewHost`)

## Bundle strategy

```
react.js     — React runtime
phaser.js    — lazy-loaded with game bootstrap
game.js      — scenes, puzzle systems
state.js     — zustand
index.js     — app shell, UI overlays
```

Run `npm run analyze` to inspect production chunk sizes.

## Asset optimization checklist

- [ ] Convert art to WebP/AVIF when bitmaps are added
- [ ] Register packs in `LoadingScene` (lazy `AssetLoader`)
- [ ] Use spritesheets for tile atlases
- [ ] Preload only menu assets; defer gameplay packs per level

## Memory

- `phaserGame.destroy()` tears down game + clears bridge listeners
- Scene `shutdown()` hooks teardown puzzle views
- Auto-save backup rotation capped at 5 entries

## Monitoring in production

Enable `VITE_ANALYTICS_ENABLED=true` and set endpoints to track session errors and level funnels.
