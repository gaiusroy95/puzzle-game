import type { SceneKey, SceneTransitionPayload } from '@shared/scenes';
import type { Game as PhaserGame } from 'phaser';

/**
 * Centralized scene transitions. Scenes request navigation through this manager
 * instead of calling this.scene.start directly, enabling analytics, guards, and fades later.
 */
export class GameSceneManager {
  private readonly scenes: Phaser.Scenes.SceneManager;

  constructor(game: PhaserGame) {
    this.scenes = game.scene;
  }

  getActiveSceneKey(): SceneKey | null {
    const active = this.scenes.getScenes(true)[0];
    return active ? (active.scene.key as SceneKey) : null;
  }

  start(scene: SceneKey, payload?: SceneTransitionPayload): void {
    this.scenes.start(scene, payload?.data ?? {});
  }

  launchOverlay(scene: SceneKey, payload?: SceneTransitionPayload): void {
    const active = this.scenes.getScenes(true)[0];
    if (!active) {
      this.scenes.run(scene, payload?.data ?? {});
      return;
    }
    active.scene.launch(scene, payload?.data ?? {});
  }

  stop(scene: SceneKey): void {
    this.scenes.stop(scene);
  }

  isActive(scene: SceneKey): boolean {
    return this.scenes.isActive(scene);
  }
}
