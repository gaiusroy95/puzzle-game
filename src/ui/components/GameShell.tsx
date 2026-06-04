import { memo } from 'react';
import { useGamePhase, useIsPhaserReady } from '@hooks/useGameStore';
import { GameBridgeListeners } from './GameBridgeListeners';
import { GameContainer } from './GameContainer';
import { PuzzleHUD } from './PuzzleHUD';
import { ContentOverlay } from '@ui/screens/ContentOverlay';
import styles from './GameShell.module.css';

function GameShellComponent() {
  const phase = useGamePhase();
  const isReady = useIsPhaserReady();
  const showOverlay = import.meta.env.VITE_ENABLE_DEBUG_OVERLAY === 'true';

  return (
    <div className={styles.shell}>
      <GameBridgeListeners />
      <GameContainer />
      <PuzzleHUD />
      <ContentOverlay />
      {showOverlay && (
        <aside className={styles.debugOverlay} aria-hidden>
          <span>Phase: {phase}</span>
          <span>Phaser: {isReady ? 'ready' : 'init'}</span>
        </aside>
      )}
    </div>
  );
}

export const GameShell = memo(GameShellComponent);
