import Phaser from 'phaser';
import type { PuzzleEntityState } from '@shared/puzzle';
import { BasePuzzleEntity, type BoardLayout } from './BasePuzzleEntity';

/** Pushable puzzle block view. */
export class PuzzleObject extends BasePuzzleEntity {
  private bodyShape: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, layout: BoardLayout, state: PuzzleEntityState) {
    super(scene, layout, state);
    const size = layout.cellSize * 0.7;
    this.bodyShape = scene.add.rectangle(0, 0, size, size, 0xc9a227);
    this.bodyShape.setStrokeStyle(2, 0xf5e6a3);
    this.add(this.bodyShape);
  }

  setOnGoal(onGoal: boolean): void {
    this.bodyShape.setFillStyle(onGoal ? 0x4ecca3 : 0xc9a227);
  }

  protected onSyncState(_state: PuzzleEntityState): void {
    // Goal highlight applied via PuzzleViewHost.setOnGoal
  }
}
