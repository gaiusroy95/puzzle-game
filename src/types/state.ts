import type { GamePhase } from './game';
import type { LevelProgressEntry } from './levels';

export interface PlayerProgress {
  currentLevelId: string | null;
  completedLevelIds: string[];
  unlockedLevelIds: string[];
  levelProgress: Record<string, LevelProgressEntry>;
  totalStars: number;
  bestScores: Record<string, number>;
  lastPlayedAt: string | null;
}

export interface SaveSlot {
  slotId: number;
  label: string;
  updatedAt: string;
  progress: PlayerProgress;
}

export interface SaveState {
  activeSlotId: number;
  slots: SaveSlot[];
  version: number;
}

/** Flat settings view for legacy UI — maps from SettingsData */
export interface SettingsState {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  fullscreen: boolean;
  reducedMotion: boolean;
  language: string;
}

export interface GlobalGameState {
  phase: GamePhase;
  sessionId: string;
  isOnline: boolean;
  lastError: string | null;
}

import { SAVE_DATA_VERSION } from '@contracts/save';

export const SAVE_STATE_VERSION = SAVE_DATA_VERSION;
export const DEFAULT_SETTINGS: SettingsState = {
  masterVolume: 1,
  musicVolume: 0.8,
  sfxVolume: 0.8,
  fullscreen: false,
  reducedMotion: false,
  language: 'en',
};

export type { PlayerProfile } from '@contracts/profile';
export type { PlayerStatistics } from '@contracts/statistics';

export const createEmptyProgress = (): PlayerProgress => ({
  currentLevelId: null,
  completedLevelIds: [],
  unlockedLevelIds: [],
  levelProgress: {},
  totalStars: 0,
  bestScores: {},
  lastPlayedAt: null,
});

export const migratePlayerProgress = (progress: PlayerProgress): PlayerProgress => ({
  ...createEmptyProgress(),
  ...progress,
  unlockedLevelIds: progress.unlockedLevelIds ?? [],
  levelProgress: progress.levelProgress ?? {},
  completedLevelIds: progress.completedLevelIds ?? [],
});

export const createDefaultSaveState = (): SaveState => ({
  activeSlotId: 0,
  version: SAVE_STATE_VERSION,
  slots: [
    {
      slotId: 0,
      label: 'Slot 1',
      updatedAt: new Date().toISOString(),
      progress: createEmptyProgress(),
    },
  ],
});
