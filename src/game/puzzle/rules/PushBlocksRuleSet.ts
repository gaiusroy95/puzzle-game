import type { Direction, LevelDefinition } from '@shared/puzzle';
import type { PuzzleWorld } from '@game/puzzle/core/PuzzleWorld';
import type { IPuzzleRuleSet, MoveResult } from './IPuzzleRuleSet';

/**
 * Sokoban-style push puzzle: player moves on grid and pushes boxes onto goals.
 */
export class PushBlocksRuleSet implements IPuzzleRuleSet {
  readonly type = 'push-blocks' as const;

  canHandle(level: LevelDefinition): boolean {
    return level.puzzleType === 'push-blocks';
  }

  tryMove(world: PuzzleWorld, direction: Direction): MoveResult {
    const player = world.getPlayer();
    if (!player) {
      return { success: false, reason: 'no_player' };
    }

    const grid = world.grid;
    const next = grid.offset({ x: player.x, y: player.y }, direction);
    const occupants = [...world.getEntities()];

    const collision = world.collision.canEnter(next, occupants, player.id);
    if (!collision.blocked) {
      world.moveEntity(player.id, next);
      world.incrementMoveCount();
      return { success: true, snapshot: world.snapshot() };
    }

    if (collision.reason !== 'entity' || !collision.entityId) {
      return { success: false, reason: collision.reason ?? 'blocked' };
    }

    const pushed = occupants.find((e) => e.id === collision.entityId);
    if (!pushed || pushed.kind !== 'box') {
      return { success: false, reason: 'blocked_by_non_pushable' };
    }

    const beyond = grid.offset(next, direction);
    const beyondCheck = world.collision.canEnter(beyond, occupants, pushed.id);
    if (beyondCheck.blocked) {
      return { success: false, reason: 'box_blocked' };
    }

    world.moveEntity(pushed.id, beyond);
    world.moveEntity(player.id, next);
    world.incrementMoveCount();
    return { success: true, snapshot: world.snapshot() };
  }

  validate(world: PuzzleWorld): void {
    const boxes = world.getBoxes();
    const goals = world.getGoals();
    if (goals.length > 0 && boxes.length > goals.length) {
      throw new Error(`Level ${world.getLevelId()}: more boxes than goals`);
    }
  }
}
