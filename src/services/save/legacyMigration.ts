import type { SavePayload } from '@contracts/save';
import { saveStateToPayload } from './saveMappers';
import type { SaveState } from '@shared/state';

const LEGACY_ZUSTAND_KEY = 'puzzle-game-save';

/** One-time migration from zustand-persist key to SaveService envelope storage. */
export const readLegacyZustandSave = (): SavePayload | null => {
  try {
    const raw = localStorage.getItem(LEGACY_ZUSTAND_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: SaveState } | SaveState;
    const state = 'state' in parsed && parsed.state ? parsed.state : (parsed as SaveState);
    if (!state.slots) return null;
    return saveStateToPayload({ ...state, version: state.version ?? 2 });
  } catch {
    return null;
  }
};

export const clearLegacyZustandSave = (): void => {
  localStorage.removeItem(LEGACY_ZUSTAND_KEY);
};
