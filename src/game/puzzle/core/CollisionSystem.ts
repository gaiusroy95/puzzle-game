import type { GridPosition, PuzzleEntityState } from '@shared/puzzle';
import type { Grid } from './Grid';

export interface CollisionResult {
  blocked: boolean;
  reason?: 'wall' | 'bounds' | 'entity';
  entityId?: string;
}

/**
 * Grid collision queries — separates spatial rules from puzzle rules.
 */
export class CollisionSystem {
  constructor(private readonly grid: Grid) {}

  canEnter(position: GridPosition, occupants: PuzzleEntityState[], ignoreId?: string): CollisionResult {
    if (!this.grid.isInBounds(position.x, position.y)) {
      return { blocked: true, reason: 'bounds' };
    }
    if (!this.grid.isWalkable(position.x, position.y)) {
      return { blocked: true, reason: 'wall' };
    }

    const blocker = occupants.find(
      (e) => e.id !== ignoreId && e.x === position.x && e.y === position.y && e.kind !== 'goal',
    );

    if (blocker) {
      return { blocked: true, reason: 'entity', entityId: blocker.id };
    }

    return { blocked: false };
  }

  getEntityAt(position: GridPosition, entities: PuzzleEntityState[]): PuzzleEntityState | undefined {
    return entities.find((e) => e.x === position.x && e.y === position.y && e.kind !== 'goal');
  }

  getGoalAt(position: GridPosition, entities: PuzzleEntityState[]): PuzzleEntityState | undefined {
    return entities.find((e) => e.x === position.x && e.y === position.y && e.kind === 'goal');
  }
}
