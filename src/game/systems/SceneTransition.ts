import type Phaser from 'phaser';
import { useSettingsStore } from '@store/settingsStore';

const DEFAULT_MS = 280;

export const fadeOutIn = (
  scene: Phaser.Scene,
  onMid: () => void,
  durationMs = DEFAULT_MS,
): void => {
  const reduced = useSettingsStore.getState().accessibility.reducedMotion;
  if (reduced) {
    onMid();
    return;
  }

  if (!scene.sys || !scene.scene.isActive()) return;

  scene.cameras.main.fadeOut(durationMs, 0, 0, 0);
  scene.time.delayedCall(durationMs, () => {
    if (!scene.sys || !scene.scene.isActive()) return;
    onMid();
    // Do not fadeIn here — onMid() may destroy this scene via scene.start().
  });
};
