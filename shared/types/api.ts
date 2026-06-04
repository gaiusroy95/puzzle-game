import type { PlayerProfile } from './profile.js';
import type { SaveEnvelope } from './save.js';
import type { PlayerStatistics } from './statistics.js';
import type { SettingsData } from './settings.js';

export interface ApiErrorBody {
  error: string;
  code: string;
  details?: Array<{ path: string; message: string }>;
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface GuestAuthResponse {
  token: string;
  playerId: string;
  expiresAt: string;
}

export interface SaveRecordResponse {
  playerId: string;
  slotId: number;
  envelope: SaveEnvelope;
  syncedAt: string;
}

export interface SaveValidateRequest {
  envelope: SaveEnvelope;
}

export interface SaveValidateResponse {
  valid: boolean;
  issues: Array<{ path: string; message: string }>;
}

export interface ProfileResponse {
  profile: PlayerProfile;
}

export interface StatisticsResponse {
  statistics: PlayerStatistics;
}

export interface CloudSaveUploadRequest {
  playerId: string;
  slotId: number;
  envelope: SaveEnvelope;
}

export interface SettingsResponse {
  settings: SettingsData;
}
