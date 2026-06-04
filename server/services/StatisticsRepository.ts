import type { PlayerStatistics } from '../../shared/types/statistics.js';
import { createEmptyStatistics } from '../../shared/types/statistics.js';
import { FileStorage } from '../storage/FileStorage.js';

export class StatisticsRepository {
  constructor(private readonly storage: FileStorage) {}

  async get(playerId: string): Promise<PlayerStatistics> {
    const existing = await this.storage.readJson<PlayerStatistics>(`statistics/${playerId}.json`);
    if (existing) return existing;
    const stats = createEmptyStatistics(playerId);
    await this.put(stats);
    return stats;
  }

  async put(stats: PlayerStatistics): Promise<PlayerStatistics> {
    const next = { ...stats, updatedAt: new Date().toISOString() };
    await this.storage.writeJson(`statistics/${stats.playerId}.json`, next);
    return next;
  }

  async patch(playerId: string, partial: Partial<PlayerStatistics>): Promise<PlayerStatistics> {
    const current = await this.get(playerId);
    return this.put({ ...current, ...partial, playerId });
  }
}
