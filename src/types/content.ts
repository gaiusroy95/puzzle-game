export type OverlayScreen = 'none' | 'level-select' | 'progress' | 'completion';

export interface CompletionScreenData {
  levelId: string;
  levelName: string;
  stars: number;
  moves: number;
  score: number;
  nextLevelId: string | null;
  isNewBest: boolean;
}
