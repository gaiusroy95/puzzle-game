import Phaser from 'phaser';
import type { GridConfig, PuzzleEntityState } from '@shared/puzzle';

export interface BoardLayout {
  originX: number;
  originY: number;
  cellSize: number;
}

export const computeBoardLayout = (
  scene: Phaser.Scene,
  grid: GridConfig,
): BoardLayout => {
  const cellSize = grid.cellSize;
  const boardWidth = grid.width * cellSize;
  const boardHeight = grid.height * cellSize;
  const { width, height } = scene.cameras.main;
  return {
    originX: (width - boardWidth) / 2,
    originY: (height - boardHeight) / 2,
    cellSize,
  };
};

export const gridToWorld = (layout: BoardLayout, x: number, y: number): { x: number; y: number } => ({
  x: layout.originX + x * layout.cellSize + layout.cellSize / 2,
  y: layout.originY + y * layout.cellSize + layout.cellSize / 2,
});

/**
 * Base Phaser view synced from logic-layer entity state.
 */
export abstract class BasePuzzleEntity extends Phaser.GameObjects.Container {
  protected entityId: string;

  constructor(
    scene: Phaser.Scene,
    protected layout: BoardLayout,
    state: PuzzleEntityState,
  ) {
    const pos = gridToWorld(layout, state.x, state.y);
    super(scene, pos.x, pos.y);
    this.entityId = state.id;
    scene.add.existing(this);
  }

  getEntityId(): string {
    return this.entityId;
  }

  syncState(state: PuzzleEntityState): void {
    const pos = gridToWorld(this.layout, state.x, state.y);
    this.setPosition(pos.x, pos.y);
    this.onSyncState(state);
  }

  protected abstract onSyncState(state: PuzzleEntityState): void;
}
