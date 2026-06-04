# Storage & Backend Architecture

## Save architecture (client)

```
┌─────────────────────────────────────────────────────────┐
│  Zustand saveStore (in-memory game state)               │
└───────────────────────────┬─────────────────────────────┘
                            │ saveStateToPayload()
                            ▼
┌─────────────────────────────────────────────────────────┐
│  SaveService                                            │
│  · AutoSaveScheduler (2s debounce)                      │
│  · Manual save                                          │
│  · SaveValidator + checksum                             │
│  · SaveSerializer → SaveEnvelope                        │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  SaveRecovery + LocalStorageAdapter                     │
│  · Primary: puzzle-save-primary                         │
│  · Backups: puzzle-save-backup-* (max 5)                │
│  · Corrupted primary → restore latest valid backup      │
│  · Legacy migration from puzzle-game-save (zustand)     │
└─────────────────────────────────────────────────────────┘
```

### Save sources

| Source | Trigger |
|--------|---------|
| `auto` | Progress change (debounced), level complete |
| `manual` | `saveManual()`, slot reset |
| `recovery` | Legacy migration |
| `cloud` | Future — via `saveApi.uploadCloudSave` |

### Security (client)

- JSON schema validation before write
- DJB2 checksum on payload — rejects tampered saves
- Invalid envelope never written to primary slot
- Previous primary copied to backup before overwrite

## Settings architecture

Structured `SettingsData` in `@contracts/settings`:

| Group | Fields |
|-------|--------|
| **audio** | master/music/sfx volume, muted |
| **display** | fullscreen, showFps, uiScale |
| **controls** | keyboard/mouse/gamepad, invertScroll |
| **accessibility** | reducedMotion, highContrast, largeText, screenReaderHints |

`SettingsValidator` clamps values on every patch.

## Player data

| Store | Persistence | Purpose |
|-------|-------------|---------|
| `profileStore` | localStorage | Player ID, display name, auth metadata |
| `saveStore` | SaveService | Campaign progress (slots) |
| `statisticsStore` | localStorage | Wins, losses, moves, play time |
| `settingsStore` | localStorage | Grouped settings v2 |

## Server architecture

```
server/
├── index.ts              # Entry
├── app.ts                # Express wiring
├── config/env.ts
├── middleware/
│   ├── errorHandler.ts   # ApiErrorBody responses
│   └── authMiddleware.ts # Bearer token (guest HMAC)
├── routes/
│   ├── index.ts          # /api router
│   ├── health.ts
│   ├── auth.ts           # POST /auth/guest
│   ├── saves.ts          # validate + cloud CRUD
│   ├── profile.ts
│   └── statistics.ts
├── services/
│   ├── AuthService.ts
│   ├── SaveRepository.ts
│   ├── ProfileRepository.ts
│   └── StatisticsRepository.ts
├── storage/FileStorage.ts
└── validation/saveValidation.ts
```

### API endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/guest` | No | Guest token + playerId |
| POST | `/api/saves/validate` | No | Server-side save validation |
| GET | `/api/saves/:playerId/:slotId` | Bearer | Download cloud save |
| PUT | `/api/saves/:playerId/:slotId` | Bearer | Upload cloud save |
| GET/PUT | `/api/profile/:playerId` | Optional | Profile CRUD |
| GET/PUT | `/api/statistics/:playerId` | Optional | Statistics CRUD |

All success responses use `{ ok: true, data: T }`. Errors use `{ error, code, details? }`.

### Future scaling

- Swap `FileStorage` for S3/Postgres repositories
- Replace `AuthService` HMAC tokens with JWT + OAuth routes
- Add sync queue in client `saveApi` when online
- `ENABLE_CLOUD_SAVES=false` disables cloud endpoints

## Client API layer

```
src/services/api/
├── ApiClient.ts      # fetch wrapper, ApiError, auth header
├── authApi.ts
├── saveApi.ts
├── profileApi.ts
└── statisticsApi.ts
```

Frontend never imports Express — only `@contracts/*` types and API services.

## Environment

```env
DATA_DIR=./data
AUTH_SECRET=change-me
ENABLE_CLOUD_SAVES=true
CORS_ORIGIN=http://localhost:5173
```

Data files written under `data/profiles`, `data/saves`, `data/statistics`.
