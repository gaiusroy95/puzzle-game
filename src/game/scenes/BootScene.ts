import { BaseScene } from '@game/scenes/BaseScene';
import { SceneKey } from '@shared/scenes';

/**
 * First scene: minimal setup, registry defaults, then hand off to LoadingScene.
 */
export class BootScene extends BaseScene {
  constructor() {
    super(SceneKey.Boot);
  }

  create(): void {
    super.create();
    this.emitPhase('boot');

    this.registry.set('appVersion', __APP_VERSION__);
    this.registry.set('bootComplete', true);

    this.cameras.main.setBackgroundColor('#0f0f1a');

    const { width, height } = this.cameras.main;
    this.add
      .text(width / 2, height / 2, 'Puzzle Game', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '28px',
        color: '#eaeaea',
      })
      .setOrigin(0.5);

    this.time.delayedCall(400, () => {
      this.goTo(SceneKey.Loading);
    });
  }
}
