# Content Pipeline

## Adding a new level (no code changes)

1. Create `public/levels/level-XX.json` using the schema in `level-01.json`.
2. Add an entry to `public/levels/manifest.json`:
   ```json
   { "id": "level-06", "file": "level-06.json", "order": 6, "stage": 3 }
   ```
3. Restart dev server or refresh — levels load at runtime via `fetch`.

## Level file schema

- `metadata` — UI, progression, stars, unlock rules
- `definition` — grid, tiles, entities, win/fail conditions

## Validation

`LevelValidator` runs on manifest and every level file at load time. Invalid files throw with path-specific errors.

## Editor foundation

- `LevelExporter` — JSON export / browser download
- `LevelImporter` — parse pasted or uploaded JSON
- `LevelExporter.borderTiles(w, h)` — helper for authoring walls

Future visual editor should read/write the same `LevelFile` schema.

## Progression

- First manifest level unlocked by default
- Completing a level unlocks the next by order
- `unlockRequirement` in metadata enforces explicit prerequisites
- Stars from `metadata.starThresholds` (move counts)
