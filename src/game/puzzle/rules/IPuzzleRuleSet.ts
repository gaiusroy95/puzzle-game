import type { Direction, LevelDefinition, PuzzleWorldSnapshot } from '@shared/puzzle';
import type { PuzzleWorld } from '@game/puzzle/core/PuzzleWorld';

export interface MoveResult {
  success: boolean;
  reason?: string;
  snapshot?: PuzzleWorldSnapshot;
}

/**
 * Pluggable rule set per puzzle type — keeps PuzzleManager free of hardcoded mechanics.
 */
export interface IPuzzleRuleSet {
  readonly type: LevelDefinition['puzzleType'];

  canHandle(level: LevelDefinition): boolean;

  tryMove(world: PuzzleWorld, direction: Direction): MoveResult;

  validate(world: PuzzleWorld): void;
}
