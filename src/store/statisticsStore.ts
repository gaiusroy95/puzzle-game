import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createEmptyStatistics, type PlayerStatistics } from '@contracts/statistics';

interface StatisticsActions {
  recordWin: (moves: number, stars: number) => void;
  recordLoss: () => void;
  recordRestart: () => void;
  addPlayTime: (ms: number) => void;
  reset: () => void;
}

export type StatisticsStore = PlayerStatistics & StatisticsActions;

export const useStatisticsStore = create<StatisticsStore>()(
  persist(
    (set, get) => ({
      ...createEmptyStatistics('pending'),
      recordWin: (moves, stars) => {
        const s = get();
        set({
          wins: s.wins + 1,
          levelsCompleted: s.levelsCompleted + 1,
          totalMoves: s.totalMoves + moves,
          bestStarRun: Math.max(s.bestStarRun, stars),
          lastSessionAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      },
      recordLoss: () => {
        const s = get();
        set({
          losses: s.losses + 1,
          lastSessionAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      },
      recordRestart: () => {
        const s = get();
        set({
          totalRestarts: s.totalRestarts + 1,
          updatedAt: new Date().toISOString(),
        });
      },
      addPlayTime: (ms) => {
        const s = get();
        set({
          totalPlayTimeMs: s.totalPlayTimeMs + ms,
          updatedAt: new Date().toISOString(),
        });
      },
      reset: () =>
        set({
          ...createEmptyStatistics(get().playerId),
        }),
    }),
    { name: 'puzzle-game-statistics' },
  ),
);

/** Bind statistics to profile playerId after hydration */
export const syncStatisticsPlayerId = (playerId: string): void => {
  const stats = useStatisticsStore.getState();
  if (stats.playerId !== playerId) {
    useStatisticsStore.setState({ ...stats, playerId });
  }
};
