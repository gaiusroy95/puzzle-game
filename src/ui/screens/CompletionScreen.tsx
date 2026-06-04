import { memo, useCallback } from 'react';
import { startLevel, goToMainMenu } from '@services/game/SceneNavigation';
import { useNavigationStore } from '@store/navigationStore';
import styles from './CompletionScreen.module.css';
import layout from './ScreenLayout.module.css';

function CompletionScreenComponent() {
  const completion = useNavigationStore((s) => s.completion);
  const close = useNavigationStore((s) => s.close);

  const handleNext = useCallback(() => {
    if (!completion?.nextLevelId) return;
    const nextId = completion.nextLevelId;
    close();
    startLevel(nextId);
  }, [completion, close]);

  const handleLevels = useCallback(() => {
    close();
    useNavigationStore.getState().setScreen('level-select');
  }, [close]);

  const handleMenu = useCallback(() => {
    close();
    goToMainMenu();
  }, [close]);

  if (!completion) return null;

  return (
    <div className={layout.overlay} role="dialog" aria-label="Level complete">
      <header className={layout.header}>
        <h2 className={layout.title}>Level Complete</h2>
      </header>
      <div className={`${layout.body} ${styles.center}`}>
        <p className={styles.levelName}>{completion.levelName}</p>
        <p className={styles.stars} aria-label={`${completion.stars} stars earned`}>
          {'★'.repeat(completion.stars)}
          {'☆'.repeat(3 - completion.stars)}
        </p>
        <p className={styles.stats}>
          {completion.moves} moves · Score {completion.score}
          {completion.isNewBest && <span className={styles.best}> · New best!</span>}
        </p>
        <div className={styles.actions}>
          {completion.nextLevelId && (
            <button type="button" className={styles.primary} onClick={handleNext}>
              Next Level
            </button>
          )}
          <button type="button" className={styles.secondary} onClick={handleLevels}>
            Level Select
          </button>
          <button type="button" className={styles.secondary} onClick={handleMenu}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}

export const CompletionScreen = memo(CompletionScreenComponent);
