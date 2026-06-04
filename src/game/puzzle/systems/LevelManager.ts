import type { LevelDefinition, PuzzleWorldSnapshot } from '@shared/puzzle';
import type { LevelMetadata, LoadedLevel } from '@shared/levels';
import { levelCatalog } from '@game/levels/LevelCatalog';

/**
 * Loads and validates level definitions; stores initial snapshot for restarts.
 */
export class LevelManager {
  private current: LevelDefinition | null = null;
  private currentMetadata: LevelMetadata | null = null;
  private initialSnapshot: PuzzleWorldSnapshot | null = null;

  async load(levelId: string): Promise<LevelDefinition> {
    const loaded = await levelCatalog.loadLevel(levelId);
    this.current = loaded.definition;
    this.currentMetadata = loaded.metadata;
    this.initialSnapshot = null;
    return loaded.definition;
  }

  getCurrent(): LevelDefinition | null {
    return this.current;
  }

  getCurrentMetadata(): LevelMetadata | null {
    return this.currentMetadata;
  }

  getLoaded(): LoadedLevel | null {
    if (!this.current || !this.currentMetadata) return null;
    return { definition: this.current, metadata: this.currentMetadata };
  }

  setInitialSnapshot(snapshot: PuzzleWorldSnapshot): void {
    this.initialSnapshot = snapshot;
  }

  getInitialSnapshot(): PuzzleWorldSnapshot | null {
    return this.initialSnapshot;
  }

  async listLevelIds(): Promise<string[]> {
    await levelCatalog.initialize();
    return levelCatalog.listLevelIds();
  }
}
