import type {
  GridPosition,
  LevelDefinition,
  LevelEntity,
  PuzzleEntityState,
  PuzzleWorldSnapshot,
} from '@shared/puzzle';
import { CollisionSystem } from './CollisionSystem';
import { Grid } from './Grid';

/**
 * Authoritative puzzle simulation state. All gameplay mutations happen here.
 */
export class PuzzleWorld {
  readonly grid: Grid;
  readonly collision: CollisionSystem;
  private entities: PuzzleEntityState[];
  private triggeredIds: Set<string>;
  moveCount = 0;

  constructor(private readonly level: LevelDefinition) {
    this.grid = new Grid(level.grid, level.tiles);
    this.collision = new CollisionSystem(this.grid);
    this.entities = level.entities.map((e) => PuzzleWorld.entityFromLevel(e));
    this.triggeredIds = new Set();
  }

  static fromSnapshot(level: LevelDefinition, snapshot: PuzzleWorldSnapshot): PuzzleWorld {
    const world = new PuzzleWorld(level);
    world.entities = snapshot.entities.map((e) => ({ ...e }));
    world.triggeredIds = new Set(snapshot.triggeredIds);
    world.moveCount = snapshot.moveCount;
    return world;
  }

  getLevelId(): string {
    return this.level.id;
  }

  getEntities(): readonly PuzzleEntityState[] {
    return this.entities;
  }

  getTriggeredIds(): readonly string[] {
    return [...this.triggeredIds];
  }

  getPlayer(): PuzzleEntityState | undefined {
    return this.entities.find((e) => e.kind === 'player');
  }

  getBoxes(): PuzzleEntityState[] {
    return this.entities.filter((e) => e.kind === 'box');
  }

  getGoals(): PuzzleEntityState[] {
    return this.entities.filter((e) => e.kind === 'goal');
  }

  getTriggers(): PuzzleEntityState[] {
    return this.entities.filter((e) => e.kind === 'trigger');
  }

  snapshot(): PuzzleWorldSnapshot {
    return {
      levelId: this.level.id,
      grid: { ...this.level.grid },
      tiles: this.grid.cloneTiles(),
      entities: this.entities.map((e) => ({ ...e })),
      triggeredIds: [...this.triggeredIds],
      moveCount: this.moveCount,
    };
  }

  reset(): void {
    this.entities = this.level.entities.map((e) => PuzzleWorld.entityFromLevel(e));
    this.triggeredIds = new Set();
    this.moveCount = 0;
  }

  moveEntity(entityId: string, to: GridPosition): boolean {
    const entity = this.entities.find((e) => e.id === entityId);
    if (!entity) return false;

    entity.x = to.x;
    entity.y = to.y;
    this.updateTriggers();
    return true;
  }

  incrementMoveCount(): void {
    this.moveCount += 1;
  }

  private updateTriggers(): void {
    for (const trigger of this.getTriggers()) {
      const occupant = this.collision.getEntityAt(
        { x: trigger.x, y: trigger.y },
        this.entities,
      );
      if (occupant && (occupant.kind === 'player' || occupant.kind === 'box' || occupant.kind === 'dynamic')) {
        if (trigger.triggerId) {
          this.triggeredIds.add(trigger.triggerId);
        }
        trigger.isActive = true;
      } else {
        trigger.isActive = false;
        if (trigger.triggerId) {
          this.triggeredIds.delete(trigger.triggerId);
        }
      }
    }
  }

  private static entityFromLevel(entity: LevelEntity): PuzzleEntityState {
    return {
      id: entity.id,
      kind: entity.kind,
      x: entity.x,
      y: entity.y,
      groupId: entity.groupId,
      triggerId: entity.triggerId,
      isActive: false,
    };
  }
}
