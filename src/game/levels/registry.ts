import type { LevelDefinition } from '@shared/puzzle';
import type { LoadedLevel } from '@shared/levels';
import { levelCatalog } from './LevelCatalog';

/**
 * Back-compat facade — prefer LevelCatalog for new code.
 */
export const levelRegistry = {
  async initialize(): Promise<void> {
    await levelCatalog.initialize();
  },
  async get(id: string): Promise<LevelDefinition | undefined> {
    try {
      return await levelCatalog.loadDefinition(id);
    } catch {
      return undefined;
    }
  },
  async getLoaded(id: string): Promise<LoadedLevel | undefined> {
    try {
      return await levelCatalog.loadLevel(id);
    } catch {
      return undefined;
    }
  },
  listIds(): string[] {
    if (!levelCatalog.isReady()) return [];
    return levelCatalog.listLevelIds();
  },
  async listIdsAsync(): Promise<string[]> {
    await levelCatalog.initialize();
    return levelCatalog.listLevelIds();
  },
};
