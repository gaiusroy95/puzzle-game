import type { PlayerProfile } from '../../shared/types/profile.js';
import { createGuestProfile } from '../../shared/types/profile.js';
import { FileStorage } from '../storage/FileStorage.js';

export class ProfileRepository {
  constructor(private readonly storage: FileStorage) {}

  async get(playerId: string): Promise<PlayerProfile> {
    const existing = await this.storage.readJson<PlayerProfile>(`profiles/${playerId}.json`);
    if (existing) return existing;
    const profile = createGuestProfile(playerId);
    await this.put(profile);
    return profile;
  }

  async put(profile: PlayerProfile): Promise<PlayerProfile> {
    const next = { ...profile, updatedAt: new Date().toISOString() };
    await this.storage.writeJson(`profiles/${profile.playerId}.json`, next);
    return next;
  }
}
