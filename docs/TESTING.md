# Testing Strategy

## Unit tests (Vitest)

**Run:** `npm test` | `npm run test:watch`

| Module | Coverage focus |
|--------|----------------|
| `shared/utils/checksum` | Save integrity |
| `SaveValidator` | Corrupt save rejection |
| `StarCalculator` | Progression scoring |

**Expand next:** `LevelValidator`, `ProgressionManager`, `SaveSerializer`

## Integration tests (recommended)

| Flow | Tooling |
|------|---------|
| API health + save validate | `supertest` against Express app |
| Level manifest load | Fetch `public/levels/manifest.json` in CI |
| Save round-trip | Client serialize → server validate endpoint |

## Gameplay manual checklist

### Boot
- [ ] Loading → Main menu without errors
- [ ] Recovery banner only when backup used

### Progression
- [ ] Level 1 unlocked by default
- [ ] Completing level unlocks next
- [ ] Stars match move thresholds
- [ ] Progress screen reflects completions

### Gameplay
- [ ] Keyboard + mouse move
- [ ] Win → completion screen
- [ ] Fail on move limit → restart works
- [ ] R and Restart button reset state

### Persistence
- [ ] Refresh page retains progress
- [ ] Auto-save after moves (no data loss)

### Settings / a11y
- [ ] Reduced motion disables scene fades
- [ ] Muted disables SFX

### Production build
- [ ] `npm run build:prod` succeeds
- [ ] `npm run preview` — full playthrough

## CI pipeline (suggested)

```yaml
- npm ci
- npm run typecheck
- npm run lint
- npm test
- npm run build
```
