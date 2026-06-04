import type { LevelFile, LevelManifest, LoadedLevel } from '@shared/levels';
import { levelValidator } from '@game/levels/validation/LevelValidator';

const LEVELS_BASE = import.meta.env.VITE_LEVELS_BASE_URL ?? '/levels';

export class LevelLoader {
  private manifestCache: LevelManifest | null = null;
  private levelCache = new Map<string, LoadedLevel>();

  async loadManifest(): Promise<LevelManifest> {
    if (this.manifestCache) return this.manifestCache;

    const response = await fetch(`${LEVELS_BASE}/manifest.json`);
    if (!response.ok) {
      throw new Error(`Failed to load level manifest: ${response.statusText}`);
    }

    const data: unknown = await response.json();
    const result = levelValidator.validateManifest(data);
    if (!result.valid) {
      throw new Error(`Invalid manifest: ${result.issues.map((i) => i.message).join('; ')}`);
    }

    this.manifestCache = data as LevelManifest;
    return this.manifestCache;
  }

  async loadLevel(fileName: string): Promise<LoadedLevel> {
    const cacheKey = fileName;
    const cached = this.levelCache.get(cacheKey);
    if (cached) return cached;

    const response = await fetch(`${LEVELS_BASE}/${fileName}`);
    if (!response.ok) {
      throw new Error(`Failed to load level ${fileName}: ${response.statusText}`);
    }

    const data: unknown = await response.json();
    const validation = levelValidator.validateLevelFile(data);
    if (!validation.valid) {
      throw new Error(
        `Invalid level ${fileName}: ${validation.issues.map((i) => `${i.path}: ${i.message}`).join('; ')}`,
      );
    }

    const file = data as LevelFile;
    const definition = levelValidator.toLevelDefinition(file);
    const loaded: LoadedLevel = { metadata: file.metadata, definition };
    this.levelCache.set(cacheKey, loaded);
    this.levelCache.set(file.metadata.id, loaded);
    return loaded;
  }

  clearCache(): void {
    this.manifestCache = null;
    this.levelCache.clear();
  }
}

export const levelLoader = new LevelLoader();
