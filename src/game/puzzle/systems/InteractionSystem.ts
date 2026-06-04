import type { InputAction } from '@shared/puzzle';
import type { PuzzleManager } from './PuzzleManager';

/**
 * Maps normalized input actions to puzzle commands.
 */
export class InteractionSystem {
  constructor(private readonly puzzle: PuzzleManager) {}

  handle(action: InputAction): void {
    switch (action.type) {
      case 'move':
        if (action.direction) {
          this.puzzle.tryMove(action.direction);
        }
        break;
      case 'interact':
        if (action.gridPosition) {
          this.handlePointerInteract(action.gridPosition);
        }
        break;
      case 'restart':
        this.puzzle.restart();
        break;
      case 'undo':
        this.puzzle.undo();
        break;
      case 'pause':
        this.puzzle.pause();
        break;
    }
  }

  private handlePointerInteract(target: { x: number; y: number }): void {
    const player = this.puzzle.getWorld()?.getPlayer();
    if (!player) return;

    const dx = target.x - player.x;
    const dy = target.y - player.y;

    if (Math.abs(dx) + Math.abs(dy) !== 1) return;

    let direction: import('@shared/puzzle').Direction | null = null;
    if (dx === 1) direction = 'right';
    else if (dx === -1) direction = 'left';
    else if (dy === 1) direction = 'down';
    else if (dy === -1) direction = 'up';

    if (direction) {
      this.puzzle.tryMove(direction);
    }
  }
}
