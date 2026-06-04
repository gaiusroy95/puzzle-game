import type { LevelMetadata } from '@shared/levels';

export class StarCalculator {
  /** Returns 0–3 stars based on move count and level thresholds. */
  static calculate(moves: number, metadata: LevelMetadata): number {
    const { threeStarMoves, twoStarMoves, oneStarMoves } = metadata.starThresholds;
    if (moves <= threeStarMoves) return 3;
    if (moves <= twoStarMoves) return 2;
    if (moves <= oneStarMoves) return 1;
    return 0;
  }

  /** Higher score is better — inverse of moves with star bonus. */
  static calculateScore(moves: number, stars: number, parMoves?: number): number {
    const par = parMoves ?? moves;
    const parBonus = Math.max(0, par - moves) * 10;
    return stars * 1000 + parBonus + Math.max(0, 500 - moves);
  }
}
