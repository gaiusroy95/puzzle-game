import { describe, expect, it } from 'vitest';
import { StarCalculator } from './StarCalculator';
import type { LevelMetadata } from '@shared/levels';

const meta: LevelMetadata = {
  id: 'test',
  name: 'Test',
  order: 1,
  stage: 1,
  difficulty: 1,
  unlockRequirement: null,
  starThresholds: { threeStarMoves: 10, twoStarMoves: 15, oneStarMoves: 20 },
};

describe('StarCalculator', () => {
  it('awards 3 stars at threshold', () => {
    expect(StarCalculator.calculate(10, meta)).toBe(3);
  });

  it('awards 0 stars above one star threshold', () => {
    expect(StarCalculator.calculate(25, meta)).toBe(0);
  });

  it('scores higher with more stars and fewer moves', () => {
    const high = StarCalculator.calculateScore(8, 3, 10);
    const low = StarCalculator.calculateScore(19, 1, 10);
    expect(high).toBeGreaterThan(low);
  });
});
