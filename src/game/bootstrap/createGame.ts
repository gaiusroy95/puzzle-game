import type { ViewportInfo } from '@shared/game';
import { capDevicePixelRatio, isProduction, PERFORMANCE } from '@/config/performance';
import type { SceneKey } from '@shared/scenes';

export interface CreateGameOptions {
  parent: HTMLElement;
  viewport: ViewportInfo;
}

/**
 * Lazy-loads Phaser and scene modules to keep initial JS bundle smaller.
 */
export const createGame = async (
  options: CreateGameOptions,
): Promise<import('phaser').Game> => {
  const Phaser = (await import('phaser')).default;
  const [{ BootScene }, { LoadingScene }, { MainMenuScene }, { GameplayScene }] =
    await Promise.all([
      import('@game/scenes/BootScene'),
      import('@game/scenes/LoadingScene'),
      import('@game/scenes/MainMenuScene'),
      import('@game/scenes/GameplayScene'),
    ]);

  const dpr = capDevicePixelRatio(options.viewport.devicePixelRatio);
  const width = Math.floor(options.viewport.width * dpr);
  const height = Math.floor(options.viewport.height * dpr);

  return new Phaser.Game({
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
      target: PERFORMANCE.targetFps,
      forceSetTimeOut: false,
      smoothStep: true,
    },
    render: {
      antialias: !isProduction,
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
        game.registry.set('sceneKeys', {
          Boot: 'BootScene',
          Loading: 'LoadingScene',
          MainMenu: 'MainMenuScene',
          Gameplay: 'GameplayScene',
        } satisfies Record<string, SceneKey>);
      },
    },
  });
};
