import Phaser from 'phaser';
import type { PuzzleEntityState } from '@shared/puzzle';
import { BasePuzzleEntity, type BoardLayout } from './BasePuzzleEntity';

/** Extensible entity for future mechanics (keys, doors, sliding blocks). */
export class DynamicPuzzleEntity extends BasePuzzleEntity {
  private bodyShape: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    layout: BoardLayout,
    state: PuzzleEntityState,
    color = 0x00b894,
  ) {
    super(scene, layout, state);
    const size = layout.cellSize * 0.65;
    this.bodyShape = scene.add.rectangle(0, 0, size, size, color);
    this.add(this.bodyShape);
  }

  protected onSyncState(state: PuzzleEntityState): void {
    this.bodyShape.setAlpha(state.isActive ? 1 : 0.75);
  }
}
