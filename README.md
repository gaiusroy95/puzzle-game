# Puzzle Game — Foundation

Production-oriented browser puzzle game scaffold: **React + TypeScript + Vite**, **Phaser 3**, **Express** API.

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

- Client: http://localhost:5173  
- API: http://localhost:3001/api/health  

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Client + server concurrently |
| `npm run build:prod` | Typecheck + test + full build |
| `npm test` | Unit tests (Vitest) |
| `npm run preview` | Preview production client |
| `npm run analyze` | Production bundle analysis |

## Documentation

- [docs/DEVELOPER.md](docs/DEVELOPER.md) — setup & conventions
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — static, CDN, cloud deploy
- [docs/PERFORMANCE.md](docs/PERFORMANCE.md) — optimization strategy
- [docs/TESTING.md](docs/TESTING.md) — test strategy & gameplay checklist
- [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) — pre-ship gate

## Architecture overview

See project documentation in the assistant deliverable (folder purposes, communication flow, extension order).
