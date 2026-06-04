export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

export interface DisplaySettings {
  fullscreen: boolean;
  showFps: boolean;
  uiScale: number;
}

export interface ControlsSettings {
  keyboardEnabled: boolean;
  mouseEnabled: boolean;
  gamepadEnabled: boolean;
  invertScroll: boolean;
}

export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReaderHints: boolean;
}

export interface SettingsData {
  version: number;
  language: string;
  audio: AudioSettings;
  display: DisplaySettings;
  controls: ControlsSettings;
  accessibility: AccessibilitySettings;
}

export const SETTINGS_DATA_VERSION = 1;

export const DEFAULT_SETTINGS_DATA: SettingsData = {
  version: SETTINGS_DATA_VERSION,
  language: 'en',
  audio: {
    masterVolume: 1,
    musicVolume: 0.8,
    sfxVolume: 0.8,
    muted: false,
  },
  display: {
    fullscreen: false,
    showFps: false,
    uiScale: 1,
  },
  controls: {
    keyboardEnabled: true,
    mouseEnabled: true,
    gamepadEnabled: true,
    invertScroll: false,
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    screenReaderHints: false,
  },
};
