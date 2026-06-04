import { memo, useEffect, useRef } from 'react';
import { phaserGame } from '@game/PhaserGame';
import { useGameStore } from '@store/gameStore';
import styles from './GameContainer.module.css';

/**
 * Mount point for Phaser — no bridge subscriptions; canvas lifecycle only.
 */
function GameContainerComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewport = useGameStore((s) => s.viewport);
  const bootedRef = useRef(false);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent || !viewport || bootedRef.current) return;

    bootedRef.current = true;
    void phaserGame.bootstrap({ parent, viewport });

    return () => {
      bootedRef.current = false;
      phaserGame.destroy();
    };
  }, [viewport]);

  return (
    <div className={styles.wrapper} aria-label="Game canvas">
      <div ref={containerRef} className={styles.canvasHost} id="phaser-game-container" />
    </div>
  );
}

export const GameContainer = memo(GameContainerComponent);
