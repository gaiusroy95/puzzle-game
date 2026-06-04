import type { PuzzleEntityState } from '@shared/puzzle';

/** True when a box occupies a goal cell and optional pair ids match. */
export const isBoxOnMatchingGoal = (
  box: PuzzleEntityState,
  goal: PuzzleEntityState,
): boolean => {
  if (box.kind !== 'box' || goal.kind !== 'goal') return false;
  if (box.x !== goal.x || box.y !== goal.y) return false;
  if (box.groupId && goal.groupId) {
    return box.groupId === goal.groupId;
  }
  return true;
};

export const isBoxOnAnyMatchingGoal = (
  box: PuzzleEntityState,
  entities: readonly PuzzleEntityState[],
): boolean =>
  entities
    .filter((e) => e.kind === 'goal')
    .some((goal) => isBoxOnMatchingGoal(box, goal));
