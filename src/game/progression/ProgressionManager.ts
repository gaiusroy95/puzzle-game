import type { LevelCompletionResult, LevelMetadata, LevelProgressEntry } from '@shared/levels';
import type { PlayerProgress } from '@shared/state';
import { levelCatalog } from '@game/levels/LevelCatalog';
import { StarCalculator } from './StarCalculator';

export interface ProgressionSnapshot {
  progress: PlayerProgress;
  entries: Array<{
    metadata: LevelMetadata;
    entry: LevelProgressEntry;
    unlocked: boolean;
  }>;
}

export class ProgressionManager {
  private metadataCache = new Map<string, LevelMetadata>();

  async ensureMetadata(levelId: string): Promise<LevelMetadata> {
    const cached = this.metadataCache.get(levelId);
    if (cached) return cached;
    const loaded = await levelCatalog.loadLevel(levelId);
    this.metadataCache.set(levelId, loaded.metadata);
    return loaded.metadata;
  }

  isUnlocked(
    levelId: string,
    progress: PlayerProgress,
    unlockRequirement: string | null = null,
  ): boolean {
    if (progress.unlockedLevelIds.includes(levelId)) return true;
    if (!unlockRequirement) return false;
    return progress.completedLevelIds.includes(unlockRequirement);
  }

  getDefaultUnlockedIds(manifestLevelIds: string[]): string[] {
    const first = manifestLevelIds[0];
    return first ? [first] : [];
  }

  ensureUnlocked(progress: PlayerProgress, manifestLevelIds: string[]): PlayerProgress {
    const defaults = this.getDefaultUnlockedIds(manifestLevelIds);
    const merged = new Set([...progress.unlockedLevelIds, ...defaults]);
    return { ...progress, unlockedLevelIds: [...merged] };
  }

  recordCompletion(
    levelId: string,
    moves: number,
    progress: PlayerProgress,
  ): { progress: PlayerProgress; result: LevelCompletionResult } {
    const metadata = this.metadataCache.get(levelId);
    if (!metadata) {
      throw new Error(`Metadata not loaded for ${levelId}. Call ensureMetadata first.`);
    }
    const stars = StarCalculator.calculate(moves, metadata);
    const score = StarCalculator.calculateScore(moves, stars, metadata.parMoves);

    const existing = progress.levelProgress[levelId];
    const isNewBest =
      !existing?.bestMoves || moves < existing.bestMoves || score > (existing.bestScore ?? 0);

    const entry: LevelProgressEntry = {
      levelId,
      completed: true,
      stars: Math.max(existing?.stars ?? 0, stars),
      bestMoves: isNewBest ? moves : (existing?.bestMoves ?? moves),
      bestScore: Math.max(existing?.bestScore ?? 0, score),
      attempts: (existing?.attempts ?? 0) + 1,
      completedAt: new Date().toISOString(),
    };

    const completedSet = new Set(progress.completedLevelIds);
    completedSet.add(levelId);

    const unlocked = new Set(progress.unlockedLevelIds);
    unlocked.add(levelId);

    if (!levelCatalog.isReady()) {
      throw new Error('LevelCatalog must be initialized before recording completion');
    }
    const ordered = levelCatalog.getOrderedEntries();

    const currentIndex = ordered.findIndex((e) => e.id === levelId);
    const nextEntry = ordered[currentIndex + 1];
    if (nextEntry) unlocked.add(nextEntry.id);

    const totalStars = Object.values({
      ...progress.levelProgress,
      [levelId]: entry,
    }).reduce((sum, e) => sum + e.stars, 0);

    const nextProgress: PlayerProgress = {
      ...progress,
      currentLevelId: levelId,
      completedLevelIds: [...completedSet],
      unlockedLevelIds: [...unlocked],
      levelProgress: { ...progress.levelProgress, [levelId]: entry },
      totalStars,
      bestScores: {
        ...progress.bestScores,
        [levelId]: entry.bestScore,
      },
      lastPlayedAt: entry.completedAt,
    };

    return {
      progress: nextProgress,
      result: {
        levelId,
        stars: entry.stars,
        moves,
        score: entry.bestScore,
        isNewBest,
        unlockedLevelIds: [...unlocked],
      },
    };
  }

  async buildSnapshot(progress: PlayerProgress): Promise<ProgressionSnapshot> {
    await levelCatalog.initialize();
    const entries = await Promise.all(
      levelCatalog.getOrderedEntries().map(async (manifestEntry) => {
        const loaded = await levelCatalog.loadLevel(manifestEntry.id);
        const entry = progress.levelProgress[manifestEntry.id] ?? {
          levelId: manifestEntry.id,
          completed: false,
          stars: 0,
          bestMoves: null,
          bestScore: 0,
          attempts: 0,
          completedAt: null,
        };
        return {
          metadata: loaded.metadata,
          entry,
          unlocked: this.isUnlocked(
            manifestEntry.id,
            progress,
            loaded.metadata.unlockRequirement,
          ),
        };
      }),
    );
    return { progress, entries };
  }

  getNextLevelId(levelId: string): string | null {
    if (!levelCatalog.isReady()) return null;
    const ordered = levelCatalog.getOrderedEntries();
    const idx = ordered.findIndex((e) => e.id === levelId);
    return ordered[idx + 1]?.id ?? null;
  }
}

export const progressionManager = new ProgressionManager();
