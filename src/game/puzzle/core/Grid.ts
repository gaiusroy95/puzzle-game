import type { GridConfig, GridPosition, LevelTile, TileType } from '@shared/puzzle';

/**
 * Pure grid model — tile layout and spatial queries without rendering.
 */
export class Grid {
  private readonly cells: TileType[][];

  constructor(
    readonly config: GridConfig,
    tiles: LevelTile[],
  ) {
    this.cells = Array.from({ length: config.height }, () =>
      Array.from({ length: config.width }, (): TileType => 'floor'),
    );

    for (const tile of tiles) {
      if (this.isInBounds(tile.x, tile.y)) {
        this.cells[tile.y]![tile.x] = tile.type;
      }
    }
  }

  get width(): number {
    return this.config.width;
  }

  get height(): number {
    return this.config.height;
  }

  getTile(x: number, y: number): TileType {
    if (!this.isInBounds(x, y)) return 'wall';
    return this.cells[y]![x]!;
  }

  isWalkable(x: number, y: number): boolean {
    return this.getTile(x, y) === 'floor';
  }

  isInBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  offset(pos: GridPosition, direction: import('@shared/puzzle').Direction): GridPosition {
    const delta = Grid.directionDelta(direction);
    return { x: pos.x + delta.x, y: pos.y + delta.y };
  }

  static directionDelta(direction: import('@shared/puzzle').Direction): GridPosition {
    switch (direction) {
      case 'up':
        return { x: 0, y: -1 };
      case 'down':
        return { x: 0, y: 1 };
      case 'left':
        return { x: -1, y: 0 };
      case 'right':
        return { x: 1, y: 0 };
    }
  }

  cloneTiles(): LevelTile[] {
    const tiles: LevelTile[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        tiles.push({ x, y, type: this.getTile(x, y) });
      }
    }
    return tiles;
  }
}
