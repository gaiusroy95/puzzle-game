import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AccessibilitySettings,
  AudioSettings,
  ControlsSettings,
  DisplaySettings,
  SettingsData,
} from '@contracts/settings';
import { DEFAULT_SETTINGS_DATA } from '@contracts/settings';
import { settingsValidator } from '@services/settings/SettingsValidator';

interface SettingsActions {
  patch: (partial: Partial<SettingsData>) => void;
  patchAudio: (partial: Partial<AudioSettings>) => void;
  patchDisplay: (partial: Partial<DisplaySettings>) => void;
  patchControls: (partial: Partial<ControlsSettings>) => void;
  patchAccessibility: (partial: Partial<AccessibilitySettings>) => void;
  reset: () => void;
}

export type SettingsStore = SettingsData & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS_DATA,
      patch: (partial) =>
        set((state) => settingsValidator.merge({ ...state, ...partial })),
      patchAudio: (partial) =>
        set((state) => settingsValidator.merge({ ...state, audio: { ...state.audio, ...partial } })),
      patchDisplay: (partial) =>
        set((state) =>
          settingsValidator.merge({ ...state, display: { ...state.display, ...partial } }),
        ),
      patchControls: (partial) =>
        set((state) =>
          settingsValidator.merge({ ...state, controls: { ...state.controls, ...partial } }),
        ),
      patchAccessibility: (partial) =>
        set((state) =>
          settingsValidator.merge({
            ...state,
            accessibility: { ...state.accessibility, ...partial },
          }),
        ),
      reset: () => set(DEFAULT_SETTINGS_DATA),
    }),
    {
      name: 'puzzle-game-settings-v2',
      merge: (persisted, current) => ({
        ...current,
        ...settingsValidator.merge({
          ...current,
          ...(persisted as Partial<SettingsData>),
        }),
      }),
    },
  ),
);
