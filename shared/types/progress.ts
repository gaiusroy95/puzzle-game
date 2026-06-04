export interface LevelProgressEntry {
  levelId: string;
  completed: boolean;
  stars: number;
  bestMoves: number | null;
  bestScore: number;
  attempts: number;
  completedAt: string | null;
}
