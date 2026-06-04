import type {
  FailConditionDefinition,
  LevelDefinition,
  PuzzlePlayState,
  WinConditionDefinition,
} from '@shared/puzzle';
import type { PuzzleWorld } from '@game/puzzle/core/PuzzleWorld';
import { isBoxOnMatchingGoal } from '@game/puzzle/utils/boxGoalMatch';

export interface ConditionEvaluation {
  state: PuzzlePlayState;
  reason?: string;
}

/**
 * Evaluates declarative win/fail conditions from level data — no puzzle-specific hardcoding.
 */
export class WinConditionSystem {
  evaluate(world: PuzzleWorld, level: LevelDefinition): ConditionEvaluation {
    const fail = this.evaluateFail(world, level.failConditions ?? [], level);
    if (fail) return fail;

    const win = this.evaluateWin(world, level.winConditions);
    if (win) return win;

    return { state: 'playing' };
  }

  private evaluateWin(
    world: PuzzleWorld,
    conditions: WinConditionDefinition[],
  ): ConditionEvaluation | null {
    if (conditions.length === 0) return null;

    const allMet = conditions.every((condition) => this.checkWinCondition(world, condition));
    if (allMet) {
      return { state: 'won', reason: 'win_conditions_met' };
    }
    return null;
  }

  private evaluateFail(
    world: PuzzleWorld,
    conditions: FailConditionDefinition[],
    level: LevelDefinition,
  ): ConditionEvaluation | null {
    for (const condition of conditions) {
      const result = this.checkFailCondition(world, condition, level);
      if (result) return result;
    }
    return null;
  }

  private checkWinCondition(world: PuzzleWorld, condition: WinConditionDefinition): boolean {
    switch (condition.type) {
      case 'all_boxes_on_goals':
        return this.allBoxesOnGoals(world);
      case 'entity_on_tile': {
        const entityId = condition.params?.['entityId'] as string | undefined;
        const x = condition.params?.['x'] as number | undefined;
        const y = condition.params?.['y'] as number | undefined;
        if (entityId == null || x == null || y == null) return false;
        const entity = world.getEntities().find((e) => e.id === entityId);
        return entity?.x === x && entity?.y === y;
      }
      case 'all_triggers_active': {
        const triggers = world.getTriggers();
        if (triggers.length === 0) return true;
        return triggers.every((t) => t.isActive);
      }
      default:
        return false;
    }
  }

  private checkFailCondition(
    world: PuzzleWorld,
    condition: FailConditionDefinition,
    level: LevelDefinition,
  ): ConditionEvaluation | null {
    switch (condition.type) {
      case 'max_moves_exceeded': {
        const maxMoves = level.limits?.maxMoves ?? (condition.params?.['maxMoves'] as number | undefined);
        if (maxMoves != null && world.moveCount > maxMoves) {
          return { state: 'lost', reason: 'max_moves_exceeded' };
        }
        return null;
      }
      case 'player_on_hazard': {
        const player = world.getPlayer();
        const hazardIds = (condition.params?.['hazardTileIds'] as string[]) ?? [];
        if (!player) return null;
        const key = `${player.x},${player.y}`;
        if (hazardIds.includes(key)) {
          return { state: 'lost', reason: 'player_on_hazard' };
        }
        return null;
      }
      default:
        return null;
    }
  }

  private allBoxesOnGoals(world: PuzzleWorld): boolean {
    const boxes = world.getBoxes();
    const goals = world.getGoals();
    if (goals.length === 0) return boxes.length === 0;

    return boxes.every((box) => goals.some((goal) => isBoxOnMatchingGoal(box, goal)));
  }
}
