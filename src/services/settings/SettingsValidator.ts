import type { SettingsData } from '@contracts/settings';
import { DEFAULT_SETTINGS_DATA } from '@contracts/settings';

export class SettingsValidator {
  validate(data: unknown): data is SettingsData {
    if (!data || typeof data !== 'object') return false;
    const s = data as Record<string, unknown>;
    return (
      typeof s.version === 'number' &&
      typeof s.language === 'string' &&
      typeof s.audio === 'object' &&
      typeof s.display === 'object' &&
      typeof s.controls === 'object' &&
      typeof s.accessibility === 'object'
    );
  }

  clamp(data: SettingsData): SettingsData {
    const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
    return {
      ...data,
      audio: {
        ...data.audio,
        masterVolume: clamp01(data.audio.masterVolume),
        musicVolume: clamp01(data.audio.musicVolume),
        sfxVolume: clamp01(data.audio.sfxVolume),
      },
      display: {
        ...data.display,
        uiScale: Math.min(2, Math.max(0.75, data.display.uiScale)),
      },
    };
  }

  merge(partial: Partial<SettingsData>): SettingsData {
    const base = DEFAULT_SETTINGS_DATA;
    return this.clamp({
      ...base,
      ...partial,
      audio: { ...base.audio, ...partial.audio },
      display: { ...base.display, ...partial.display },
      controls: { ...base.controls, ...partial.controls },
      accessibility: { ...base.accessibility, ...partial.accessibility },
    });
  }
}

export const settingsValidator = new SettingsValidator();
