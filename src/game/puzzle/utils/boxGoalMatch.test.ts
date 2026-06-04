import { describe, expect, it } from 'vitest';
import { isBoxOnAnyMatchingGoal, isBoxOnMatchingGoal } from './boxGoalMatch';
import type { PuzzleEntityState } from '@shared/puzzle';

const box = (id: string, x: number, y: number, groupId?: string): PuzzleEntityState => ({
  id,
  kind: 'box',
  x,
  y,
  groupId,
});

const goal = (id: string, x: number, y: number, groupId?: string): PuzzleEntityState => ({
  id,
  kind: 'goal',
  x,
  y,
  groupId,
});

describe('isBoxOnMatchingGoal', () => {
  it('accepts any goal when no group ids', () => {
    expect(isBoxOnMatchingGoal(box('b', 2, 3), goal('g', 2, 3))).toBe(true);
  });

  it('requires matching group ids when both are set', () => {
    expect(isBoxOnMatchingGoal(box('b', 2, 3, 'a'), goal('g', 2, 3, 'a'))).toBe(true);
    expect(isBoxOnMatchingGoal(box('b', 2, 3, 'a'), goal('g', 2, 3, 'b'))).toBe(false);
  });

  it('does not count same cell with wrong pair as on goal', () => {
    const boxEntity = box('b', 2, 3, 'a');
    const entities = [boxEntity, goal('g', 2, 3, 'b')];
    expect(isBoxOnAnyMatchingGoal(boxEntity, entities)).toBe(false);
  });
});
