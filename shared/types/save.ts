import type { LevelProgressEntry } from './progress.js';

/** Canonical save format — shared by client local storage and cloud API. */
export const SAVE_DATA_VERSION = 3;

export interface PlayerProgressData {
  currentLevelId: string | null;
  completedLevelIds: string[];
  unlockedLevelIds: string[];
  levelProgress: Record<string, LevelProgressEntry>;
  totalStars: number;
  bestScores: Record<string, number>;
  lastPlayedAt: string | null;
}

export interface SaveSlotData {
  slotId: number;
  label: string;
  updatedAt: string;
  progress: PlayerProgressData;
}

export interface SavePayload {
  version: number;
  activeSlotId: number;
  slots: SaveSlotData[];
}

export type SaveSource = 'auto' | 'manual' | 'cloud' | 'recovery';

export interface SaveEnvelope {
  version: number;
  checksum: string;
  savedAt: string;
  source: SaveSource;
  payload: SavePayload;
}

export interface SaveBackupEntry {
  id: string;
  envelope: SaveEnvelope;
  createdAt: string;
}

export interface SaveRecoveryState {
  backups: SaveBackupEntry[];
  lastValidEnvelope: SaveEnvelope | null;
  lastError: string | null;
}
