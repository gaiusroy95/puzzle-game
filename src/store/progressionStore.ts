import { create } from 'zustand';
import type { ProgressionSnapshot } from '@game/progression/ProgressionManager';
import { progressionManager } from '@game/progression/ProgressionManager';
import { useSaveStore } from './saveStore';

interface ProgressionState {
  snapshot: ProgressionSnapshot | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export const useProgressionStore = create<ProgressionState>((set) => ({
  snapshot: null,
  isLoading: false,
  refresh: async () => {
    set({ isLoading: true });
    const save = useSaveStore.getState();
    const slot = save.slots.find((s) => s.slotId === save.activeSlotId);
    const progress = slot?.progress;
    if (!progress) {
      set({ snapshot: null, isLoading: false });
      return;
    }
    const snapshot = await progressionManager.buildSnapshot(progress);
    set({ snapshot, isLoading: false });
  },
}));
