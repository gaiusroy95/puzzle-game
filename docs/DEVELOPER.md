# Developer Guide

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:3001/api/health

## Project structure (release)

```
puzzle-game/
├── public/levels/       # JSON content (CDN-friendly)
├── shared/types/        # Client + server contracts
├── src/
│   ├── game/            # Phaser engine (lazy-loaded)
│   ├── ui/              # React overlays
│   ├── services/        # Save, API, analytics
│   ├── store/           # Zustand state
│   └── config/          # Performance tuning
├── server/              # Express API
├── docs/                # Performance, deploy, testing
└── scripts/             # Deploy helpers
```

## Key commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Client + server |
| `npm test` | Unit tests |
| `npm run typecheck` | TypeScript |
| `npm run build:prod` | Release build gate |
| `npm run preview` | Preview production client |

## Adding content

See [CONTENT_PIPELINE.md](../CONTENT_PIPELINE.md).

## Architecture docs

- [ARCHITECTURE.md](../ARCHITECTURE.md) — systems overview
- [STORAGE_ARCHITECTURE.md](../STORAGE_ARCHITECTURE.md) — saves & API
- [PERFORMANCE.md](./PERFORMANCE.md) — optimization

## Code conventions

- Game logic stays in `src/game/` (no React imports)
- React uses `GameBridge` for engine events
- Shared API types in `shared/types/`
- Production flags via `src/config/performance.ts`
