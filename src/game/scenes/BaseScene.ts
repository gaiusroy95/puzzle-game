import Phaser from 'phaser';
import { GameSceneManager } from '@game/managers/SceneManager';
import { gameBridge } from '@services/GameBridge';
import type { GamePhase } from '@shared/game';
import type { SceneKey } from '@shared/scenes';

export abstract class BaseScene extends Phaser.Scene {
  protected sceneManager!: GameSceneManager;

  constructor(key: SceneKey) {
    super({ key });
  }

  init(): void {
    this.sceneManager = new GameSceneManager(this.game);
  }

  create(): void {
    gameBridge.emit('game:scene', { scene: this.scene.key as SceneKey });
  }

  protected goTo(scene: SceneKey, data?: Record<string, unknown>): void {
    const payload = data ? { data } : undefined;
    void import('@game/systems/SceneTransition').then(({ fadeOutIn }) => {
      fadeOutIn(this, () => this.sceneManager.start(scene, payload));
    });
  }

  protected emitPhase(phase: GamePhase): void {
    gameBridge.emit('game:phase', { phase });
  }
}
