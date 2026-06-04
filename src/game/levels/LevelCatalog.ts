import type { LevelDefinition } from '@shared/puzzle';
import type { LevelManifest, LevelManifestEntry, LoadedLevel } from '@shared/levels';
import { levelLoader } from './LevelLoader';

/**
 * Central catalog — manifest-driven level list with dynamic JSON loading.
 */
export class LevelCatalog {
  private manifest: LevelManifest | null = null;
  private entriesById = new Map<string, LevelManifestEntry>();
  private initialized = false;

  async initialize(): Promise<LevelManifest> {
    if (this.initialized && this.manifest) return this.manifest;

    this.manifest = await levelLoader.loadManifest();
    this.entriesById.clear();
    for (const entry of this.manifest.levels) {
      this.entriesById.set(entry.id, entry);
    }
    this.initialized = true;
    return this.manifest;
  }

  isReady(): boolean {
    return this.initialized;
  }

  getManifest(): LevelManifest {
    if (!this.manifest) throw new Error('LevelCatalog not initialized');
    return this.manifest;
  }

  getOrderedEntries(): LevelManifestEntry[] {
    return [...this.getManifest().levels].sort((a, b) => a.order - b.order);
  }

  getEntry(levelId: string): LevelManifestEntry | undefined {
    return this.entriesById.get(levelId);
  }

  async loadLevel(levelId: string): Promise<LoadedLevel> {
    await this.initialize();
    const entry = this.entriesById.get(levelId);
    if (!entry) throw new Error(`Level not in manifest: ${levelId}`);
    return levelLoader.loadLevel(entry.file);
  }

  async loadDefinition(levelId: string): Promise<LevelDefinition> {
    const loaded = await this.loadLevel(levelId);
    return loaded.definition;
  }

  listLevelIds(): string[] {
    return this.getOrderedEntries().map((e) => e.id);
  }
}

export const levelCatalog = new LevelCatalog();
