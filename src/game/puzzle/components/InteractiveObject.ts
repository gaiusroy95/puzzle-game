import Phaser from 'phaser';
import type { PuzzleEntityState } from '@shared/puzzle';
import { BasePuzzleEntity, type BoardLayout } from './BasePuzzleEntity';

/**
 * Generic interactable marker (player avatar uses this base).
 */
export class InteractiveObject extends BasePuzzleEntity {
  protected bodyShape: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, layout: BoardLayout, state: PuzzleEntityState, color: number) {
    super(scene, layout, state);
    this.bodyShape = scene.add.circle(0, 0, layout.cellSize * 0.32, color);
    this.add(this.bodyShape);
  }

  protected onSyncState(_state: PuzzleEntityState): void {
    // Position updated by base class
  }
}
