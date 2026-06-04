import { gameBridge } from '@services/GameBridge';
import { phaserGame } from '@game/PhaserGame';
import { useSettingsStore } from '@store/settingsStore';

/**
 * Lightweight UX feedback — camera shake / flash via Phaser when available.
 */
class FeedbackService {
  onWin(): void {
    gameBridge.emit('feedback:win', {});
    this.flash(0x4ecca3, 0.12);
  }

  onLose(): void {
    gameBridge.emit('feedback:lose', {});
    this.flash(0xe74c3c, 0.1);
  }

  private flash(color: number, alpha: number): void {
    if (useSettingsStore.getState().accessibility.reducedMotion) return;
    const game = phaserGame.getGame();
    const scene = game?.scene.getScenes(true)[0];
    if (!scene) return;
    const cam = scene.cameras.main;
    cam.flash(200, color, alpha);
  }
}

export const feedbackService = new FeedbackService();
