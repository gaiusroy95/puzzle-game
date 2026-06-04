import Phaser from 'phaser';
import { BootScene } from '@game/scenes/BootScene';
import { LoadingScene } from '@game/scenes/LoadingScene';
import { MainMenuScene } from '@game/scenes/MainMenuScene';
import { GameplayScene } from '@game/scenes/GameplayScene';
import { SceneKey } from '@shared/scenes';

export interface GameConfigOptions {
  parent: HTMLElement;
  width: number;
  height: number;
  devicePixelRatio?: number;
}

export const createPhaserConfig = (options: GameConfigOptions): Phaser.Types.Core.GameConfig => {
  const dpr = options.devicePixelRatio ?? 1;
  const width = Math.floor(options.width * dpr);
  const height = Math.floor(options.height * dpr);

  return {
    type: Phaser.AUTO,
    parent: options.parent,
    width,
    height,
    backgroundColor: '#1a1a2e',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    fps: {
      target: 60,
      forceSetTimeOut: false,
      smoothStep: true,
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: true,
      powerPreference: 'high-performance',
    },
    audio: {
      disableWebAudio: false,
    },
    scene: [BootScene, LoadingScene, MainMenuScene, GameplayScene],
    callbacks: {
      preBoot: (game) => {
        game.registry.set('sceneKeys', SceneKey);
      },
    },
  };
};
