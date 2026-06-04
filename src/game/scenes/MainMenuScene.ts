import { BaseScene } from '@game/scenes/BaseScene';
import { gameBridge } from '@services/GameBridge';
import { SceneKey } from '@shared/scenes';

/**
 * Main menu shell — routes to React overlays and gameplay.
 */
export class MainMenuScene extends BaseScene {
  constructor() {
    super(SceneKey.MainMenu);
  }

  create(): void {
    super.create();
    this.emitPhase('menu');

    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor('#16213e');

    this.add
      .text(width / 2, height * 0.28, 'Puzzle Game', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '36px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.createButton(width / 2, height * 0.46, 'Level Select', () => {
      gameBridge.emit('nav:screen', { screen: 'level-select' });
    });

    this.createButton(width / 2, height * 0.56, 'Progress', () => {
      gameBridge.emit('nav:screen', { screen: 'progress' });
    });

    this.add
      .text(width / 2, height * 0.7, 'Arrow keys / WASD · R to restart', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        color: '#a0a0b0',
      })
      .setOrigin(0.5);

    const version = this.registry.get('appVersion') as string;
    this.add
      .text(width - 12, height - 12, `v${version}`, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#666680',
      })
      .setOrigin(1, 1);
  }

  private createButton(x: number, y: number, label: string, onClick: () => void): void {
    const btn = this.add
      .text(x, y, label, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '20px',
        color: '#4ecca3',
        backgroundColor: '#0f3460',
        padding: { x: 24, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerdown', onClick);
  }
}
