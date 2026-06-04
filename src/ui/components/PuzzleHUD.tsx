import { memo, useCallback, useState } from 'react';
import { useGameBridge } from '@hooks/useGameBridge';
import { gameBridge } from '@services/GameBridge';
import type { PuzzlePlayState } from '@shared/puzzle';
import styles from './PuzzleHUD.module.css';

function PuzzleHUDComponent() {
  const [puzzleState, setPuzzleState] = useState<PuzzlePlayState>('idle');
  const [reason, setReason] = useState<string | undefined>();

  useGameBridge('puzzle:state', ({ state, reason: r }) => {
    setPuzzleState(state);
    setReason(r);
  });

  const handleRestart = useCallback(() => {
    gameBridge.emit('puzzle:command', { type: 'restart' });
  }, []);

  if (puzzleState === 'idle') {
    return null;
  }

  return (
    <footer className={styles.hud}>
      <div className={styles.status}>
        {puzzleState === 'won' && <span className={styles.won}>Level complete</span>}
        {puzzleState === 'lost' && (
          <span className={styles.lost}>{reason ?? 'Failed'} — try again</span>
        )}
        {puzzleState === 'playing' && <span className={styles.playing}>Playing</span>}
        {puzzleState === 'paused' && <span>Paused</span>}
      </div>
      <button type="button" className={styles.restartBtn} onClick={handleRestart}>
        Restart Level
      </button>
    </footer>
  );
}

export const PuzzleHUD = memo(PuzzleHUDComponent);
