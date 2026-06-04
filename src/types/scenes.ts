export const SceneKey = {
  Boot: 'BootScene',
  Loading: 'LoadingScene',
  MainMenu: 'MainMenuScene',
  Gameplay: 'GameplayScene',
} as const;

export type SceneKey = (typeof SceneKey)[keyof typeof SceneKey];

export interface SceneTransitionPayload {
  data?: Record<string, unknown>;
}
