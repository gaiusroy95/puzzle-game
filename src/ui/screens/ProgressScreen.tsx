import { memo, useEffect } from 'react';
import { useNavigationStore } from '@store/navigationStore';
import { useProgressionStore } from '@store/progressionStore';
import styles from './ProgressScreen.module.css';
import layout from './ScreenLayout.module.css';

function ProgressScreenComponent() {
  const close = useNavigationStore((s) => s.close);
  const snapshot = useProgressionStore((s) => s.snapshot);
  const refresh = useProgressionStore((s) => s.refresh);
  const loading = useProgressionStore((s) => s.isLoading);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const progress = snapshot?.progress;
  const completed = progress?.completedLevelIds.length ?? 0;
  const total = snapshot?.entries.length ?? 0;
  const stars = progress?.totalStars ?? 0;

  return (
    <div className={layout.overlay} role="dialog" aria-label="Progress">
      <header className={layout.header}>
        <h2 className={layout.title}>Campaign Progress</h2>
        <button type="button" className={layout.closeBtn} onClick={close}>
          Close
        </button>
      </header>
      <div className={layout.body}>
        {loading && <p className={styles.hint}>Loading…</p>}
        <div className={styles.summary}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{completed}/{total}</span>
            <span className={styles.statLabel}>Levels completed</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stars}</span>
            <span className={styles.statLabel}>Total stars</span>
          </div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Level</th>
              <th>Stars</th>
              <th>Best moves</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {snapshot?.entries.map(({ metadata, entry, unlocked }) => (
              <tr key={metadata.id}>
                <td>{metadata.name}</td>
                <td>{'★'.repeat(entry.stars)}{'☆'.repeat(3 - entry.stars)}</td>
                <td>{entry.bestMoves ?? '—'}</td>
                <td>{entry.bestScore > 0 ? entry.bestScore : '—'}</td>
                <td>
                  {!unlocked && <span className={styles.locked}>Locked</span>}
                  {unlocked && !entry.completed && <span className={styles.open}>Available</span>}
                  {entry.completed && <span className={styles.done}>Complete</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const ProgressScreen = memo(ProgressScreenComponent);
