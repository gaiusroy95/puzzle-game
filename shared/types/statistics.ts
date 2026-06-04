export interface PlayerStatistics {
  playerId: string;
  totalPlayTimeMs: number;
  levelsCompleted: number;
  totalMoves: number;
  totalRestarts: number;
  wins: number;
  losses: number;
  bestStarRun: number;
  lastSessionAt: string | null;
  updatedAt: string;
}

export const createEmptyStatistics = (playerId: string): PlayerStatistics => ({
  playerId,
  totalPlayTimeMs: 0,
  levelsCompleted: 0,
  totalMoves: 0,
  totalRestarts: 0,
  wins: 0,
  losses: 0,
  bestStarRun: 0,
  lastSessionAt: null,
  updatedAt: new Date().toISOString(),
});
