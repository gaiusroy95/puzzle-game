import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import type { LevelCompletionResult } from '@shared/levels';
import { progressionManager } from '@game/progression/ProgressionManager';
import { levelCatalog } from '@game/levels/LevelCatalog';
import {
  saveService,
  saveStateToPayload,
  payloadToSaveState,
} from '@services/save';
import { clearLegacyZustandSave, readLegacyZustandSave } from '@services/save/legacyMigration';
import {
  createDefaultSaveState,
  createEmptyProgress,
  migratePlayerProgress,
  SAVE_STATE_VERSION,
  type PlayerProgress,
  type SaveState,
} from '@shared/state';

interface SaveActions {
  setActiveSlot: (slotId: number) => void;
  updateProgress: (updater: (progress: PlayerProgress) => PlayerProgress) => void;
  recordLevelCompletion: (levelId: string, moves: number) => Promise<LevelCompletionResult>;
  ensureDefaults: () => void;
  saveManual: () => Promise<boolean>;
  hydrateFromRecovery: () => string | null;
  resetSlot: (slotId: number) => void;
  resetAll: () => void;
}

export type SaveStore = SaveState & SaveActions;

const applyPersistedState = (state: SaveState): void => {
  useSaveStore.setState(state);
};

export const useSaveStore = create<SaveStore>()(
  subscribeWithSelector((set, get) => ({
    ...createDefaultSaveState(),
    setActiveSlot: (slotId) => {
      set({ activeSlotId: slotId });
      saveService.scheduleAutoSave();
    },
    updateProgress: (updater) => {
      const { activeSlotId, slots } = get();
      set({
        slots: slots.map((slot) =>
          slot.slotId === activeSlotId
            ? {
                ...slot,
                updatedAt: new Date().toISOString(),
                progress: updater(slot.progress),
              }
            : slot,
        ),
      });
      saveService.scheduleAutoSave();
    },
    recordLevelCompletion: async (levelId, moves) => {
      await levelCatalog.initialize();
      await progressionManager.ensureMetadata(levelId);
      let result: LevelCompletionResult = {
        levelId,
        stars: 0,
        moves,
        score: 0,
        isNewBest: false,
        unlockedLevelIds: [],
      };
      get().updateProgress((progress) => {
        const migrated = migratePlayerProgress(progress);
        const withUnlocks = progressionManager.ensureUnlocked(
          migrated,
          levelCatalog.listLevelIds(),
        );
        const { progress: next, result: r } = progressionManager.recordCompletion(
          levelId,
          moves,
          withUnlocks,
        );
        result = r;
        return next;
      });
      await saveService.save('auto');
      return result;
    },
    ensureDefaults: () => {
      get().updateProgress((progress) => {
        const migrated = migratePlayerProgress(progress);
        return progressionManager.ensureUnlocked(
          migrated,
          levelCatalog.isReady() ? levelCatalog.listLevelIds() : ['level-01'],
        );
      });
    },
    saveManual: () => saveService.saveManual(),
    hydrateFromRecovery: () => {
      const recovery = saveService.initialize();
      if (recovery.lastValidEnvelope) {
        applyPersistedState(payloadToSaveState(recovery.lastValidEnvelope.payload));
        return recovery.lastError;
      }
      const legacy = readLegacyZustandSave();
      if (legacy) {
        applyPersistedState(payloadToSaveState(legacy));
        void saveService.save('recovery');
        clearLegacyZustandSave();
        return 'Migrated legacy save';
      }
      return recovery.lastError;
    },
    resetSlot: (slotId) => {
      set((state) => ({
        slots: state.slots.map((slot) =>
          slot.slotId === slotId
            ? { ...slot, progress: createEmptyProgress(), updatedAt: new Date().toISOString() }
            : slot,
        ),
      }));
      void saveService.saveManual();
    },
    resetAll: () => {
      set(createDefaultSaveState());
      void saveService.saveManual();
    },
  })),
);

saveService.setPayloadProvider(() => saveStateToPayload(useSaveStore.getState()));

useSaveStore.subscribe(
  (state) => ({ activeSlotId: state.activeSlotId, slots: state.slots }),
  () => saveService.scheduleAutoSave(),
  { equalityFn: shallow },
);

export const SAVE_STORE_VERSION = SAVE_STATE_VERSION;
