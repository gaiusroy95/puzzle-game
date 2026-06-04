import Phaser from 'phaser';
import type { PuzzleEntityState } from '@shared/puzzle';
import { BasePuzzleEntity, type BoardLayout } from './BasePuzzleEntity';

/** Goal tile overlay — shows target cell for boxes. */
export class GoalObject extends BasePuzzleEntity {
  private ring: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, layout: BoardLayout, state: PuzzleEntityState) {
    super(scene, layout, state);
    const radius = layout.cellSize * 0.28;
    this.ring = scene.add.circle(0, 0, radius);
    this.ring.setStrokeStyle(3, 0x4ecca3, 0.9);
    this.ring.setFillStyle(0x4ecca3, 0.15);
    this.add(this.ring);
  }

  protected onSyncState(state: PuzzleEntityState): void {
    const filled = state.isActive === true;
    this.ring.setFillStyle(filled ? 0x4ecca3 : 0x4ecca3, filled ? 0.55 : 0.15);
  }
}
