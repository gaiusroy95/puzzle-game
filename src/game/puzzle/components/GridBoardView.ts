import Phaser from 'phaser';
import type { GridConfig, LevelTile, TileType } from '@shared/puzzle';
import type { BoardLayout } from './BasePuzzleEntity';

const TILE_COLORS: Record<TileType, number> = {
  floor: 0x2d3a4f,
  wall: 0x0f3460,
};

/**
 * Renders static grid tiles from level data.
 */
export class GridBoardView extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    layout: BoardLayout,
    grid: GridConfig,
    tiles: LevelTile[],
  ) {
    super(scene, 0, 0);
    scene.add.existing(this);

    const tileMap = new Map<string, TileType>();
    for (const tile of tiles) {
      tileMap.set(`${tile.x},${tile.y}`, tile.type);
    }

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const type = tileMap.get(`${x},${y}`) ?? 'floor';
        const color = TILE_COLORS[type];
        const px = layout.originX + x * layout.cellSize;
        const py = layout.originY + y * layout.cellSize;
        const rect = scene.add.rectangle(
          px + layout.cellSize / 2,
          py + layout.cellSize / 2,
          layout.cellSize - 2,
          layout.cellSize - 2,
          color,
        );
        rect.setStrokeStyle(1, 0x1a1a2e, 0.6);
        this.add(rect);
      }
    }
  }
}
