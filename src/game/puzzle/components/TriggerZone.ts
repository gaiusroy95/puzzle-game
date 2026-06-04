import Phaser from 'phaser';
import type { PuzzleEntityState } from '@shared/puzzle';
import { BasePuzzleEntity, type BoardLayout } from './BasePuzzleEntity';

/** Pressure plate / trigger zone visualization. */
export class TriggerZone extends BasePuzzleEntity {
  private plate: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, layout: BoardLayout, state: PuzzleEntityState) {
    super(scene, layout, state);
    const size = layout.cellSize * 0.5;
    this.plate = scene.add.rectangle(0, 0, size, size, 0x6c5ce7, 0.35);
    this.plate.setStrokeStyle(2, 0xa29bfe);
    this.add(this.plate);
  }

  protected onSyncState(state: PuzzleEntityState): void {
    this.plate.setFillStyle(0x6c5ce7, state.isActive ? 0.85 : 0.35);
  }
}
