# Architecture

## Folder map

| Path | Purpose |
|------|---------|
| `src/game/` | Phaser engine: scenes, systems, managers — no React imports |
| `src/game/scenes/` | Scene classes (Boot → Loading → MainMenu) |
| `src/game/systems/` | Cross-scene systems (asset loading, future physics/input) |
| `src/game/managers/` | Orchestration (scene transitions, future audio/input managers) |
| `src/game/components/` | Reusable Phaser game objects (sprites, boards, tiles) |
| `src/game/levels/` | Level definitions and puzzle data |
| `src/game/config/` | Phaser `GameConfig` factory |
| `src/ui/` | React presentation layer over the canvas |
| `src/hooks/` | React hooks bridging UI ↔ store ↔ GameBridge |
| `src/services/` | API client, GameBridge, future multiplayer session |
| `src/store/` | Zustand: runtime game, settings, save/progress |
| `src/types/` | Shared TypeScript contracts (import as `@shared/*`) |
| `src/assets/` | Static art/audio referenced by Vite (import or URL) |
| `server/` | Express API for persistence, leaderboards, multiplayer later |
| `public/` | Static files served as-is (favicon, manifest) |

## Communication

```
React (UI)  ←→  Zustand stores  ←→  hooks/selectors
     ↓                              ↑
 GameBridge (typed events)
     ↓                              ↑
 Phaser scenes  →  SceneManager  →  systems (AssetLoader)
```

- **Phaser initializes once** via `phaserGame` singleton in `GameContainer`.
- **React does not own game loop**; it only mounts the DOM parent and reacts to bridge events.
- **Scene changes** stay inside Phaser; UI learns phase via `game:phase` events.

## Puzzle gameplay layer

| Path | Role |
|------|------|
| `src/game/puzzle/core/` | Pure logic: `Grid`, `PuzzleWorld`, `CollisionSystem` |
| `src/game/puzzle/systems/` | `PuzzleManager`, `LevelManager`, `InputManager`, `InteractionSystem`, `WinConditionSystem`, `GameStateController` |
| `src/game/puzzle/rules/` | Pluggable `IPuzzleRuleSet` per puzzle type |
| `src/game/puzzle/components/` | Phaser views synced from snapshots (no rules) |
| `src/game/levels/` | Level definitions + `levelRegistry` |

Logic → `PuzzleManager` → `PuzzleViewHost` (render). Input → `InteractionSystem` → `PuzzleManager`.

## Extension order

1. Add assets under `src/assets/` and register packs in `LoadingScene`.
2. Add level files under `src/game/levels/definitions/` and register in `registry.ts`.
3. Wire menu buttons in `MainMenuScene` through `SceneManager`.
4. Persist progress via `useSaveStore` from gameplay systems through GameBridge.
5. Add `server/routes` for cloud saves; swap `MultiplayerSessionService` to WebSocket.
