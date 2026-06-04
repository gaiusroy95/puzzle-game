import type { LevelDefinition } from './puzzle';

/** Star thresholds: max moves allowed to earn each tier. */
export interface StarThresholds {
  threeStarMoves: number;
  twoStarMoves: number;
  oneStarMoves: number;
}

export interface LevelMetadata {
  id: string;
  name: string;
  description?: string;
  order: number;
  stage: number;
  difficulty: number;
  /** Level id that must be completed first; null = always available (if in unlocked set). */
  unlockRequirement: string | null;
  starThresholds: StarThresholds;
  parMoves?: number;
  tags?: string[];
}

/** External level file schema (JSON on disk). */
export interface LevelFile {
  version: number;
  metadata: LevelMetadata;
  definition: Omit<LevelDefinition, 'id' | 'name' | 'puzzleType'> & {
    puzzleType: LevelDefinition['puzzleType'];
  };
}

export interface LevelManifestEntry {
  id: string;
  file: string;
  order: number;
  stage: number;
}

export interface LevelManifest {
  version: number;
  campaignId: string;
  campaignName: string;
  levels: LevelManifestEntry[];
}

export interface LoadedLevel {
  metadata: LevelMetadata;
  definition: LevelDefinition;
}

export interface LevelCompletionResult {
  levelId: string;
  stars: number;
  moves: number;
  score: number;
  isNewBest: boolean;
  unlockedLevelIds: string[];
}

export interface LevelProgressEntry {
  levelId: string;
  completed: boolean;
  stars: number;
  bestMoves: number | null;
  bestScore: number;
  attempts: number;
  completedAt: string | null;
}
