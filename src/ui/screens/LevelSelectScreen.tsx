import { memo, useCallback, useEffect } from 'react';
import { startLevel } from '@services/game/SceneNavigation';
import { useNavigationStore } from '@store/navigationStore';
import { useProgressionStore } from '@store/progressionStore';
import { useSaveStore } from '@store/saveStore';
import styles from './LevelSelectScreen.module.css';
import layout from './ScreenLayout.module.css';

function LevelSelectScreenComponent() {
  const close = useNavigationStore((s) => s.close);
  const snapshot = useProgressionStore((s) => s.snapshot);
  const isLoading = useProgressionStore((s) => s.refresh);
  const loading = useProgressionStore((s) => s.isLoading);
  const ensureDefaults = useSaveStore((s) => s.ensureDefaults);

  useEffect(() => {
    ensureDefaults();
    void isLoading();
  }, [ensureDefaults, isLoading]);

  const handleSelect = useCallback(
    (levelId: string, unlocked: boolean) => {
      if (!unlocked) return;
      close();
      startLevel(levelId);
    },
    [close],
  );

  return (
    <div className={layout.overlay} role="dialog" aria-label="Level select">
      <header className={layout.header}>
        <h2 className={layout.title}>Select Level</h2>
        <button type="button" className={layout.closeBtn} onClick={close}>
          Close
        </button>
      </header>
      <div className={layout.body}>
        {loading && <p className={styles.hint}>Loading levels…</p>}
        <ul className={styles.grid}>
          {snapshot?.entries.map(({ metadata, entry, unlocked }) => (
            <li key={metadata.id}>
              <button
                type="button"
                className={`${styles.card} ${unlocked ? '' : styles.locked}`}
                disabled={!unlocked}
                onClick={() => handleSelect(metadata.id, unlocked)}
              >
                <span className={styles.order}>{metadata.order}</span>
                <span className={styles.name}>{metadata.name}</span>
                <span className={styles.meta}>
                  Stage {metadata.stage} · Difficulty {metadata.difficulty}
                </span>
                <span className={styles.stars} aria-label={`${entry.stars} stars`}>
                  {'★'.repeat(entry.stars)}
                  {'☆'.repeat(3 - entry.stars)}
                </span>
                {entry.completed && (
                  <span className={styles.done}>Best: {entry.bestMoves} moves</span>
                )}
                {!unlocked && <span className={styles.lockLabel}>Locked</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export const LevelSelectScreen = memo(LevelSelectScreenComponent);
