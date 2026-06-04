import { createGame } from '@game/bootstrap/createGame';
import { gameBridge } from '@services/GameBridge';
import { useGameStore } from '@store/gameStore';
import type { ViewportInfo } from '@shared/game';
import { capDevicePixelRatio } from '@/config/performance';

export interface PhaserGameBootstrapOptions {
  parent: HTMLElement;
  viewport: ViewportInfo;
}

/**
 * Singleton Phaser lifecycle. Ensures exactly one Game instance per page lifetime.
 */
class PhaserGameSingleton {
  private game: import('phaser').Game | null = null;
  private parent: HTMLElement | null = null;
  private bootstrapping: Promise<import('phaser').Game> | null = null;
  private resizeHandler: (() => void) | null = null;

  isRunning(): boolean {
    return this.game !== null;
  }

  bootstrap(options: PhaserGameBootstrapOptions): Promise<import('phaser').Game> {
    if (this.game) return Promise.resolve(this.game);
    if (this.bootstrapping) return this.bootstrapping;

    this.parent = options.parent;
    this.bootstrapping = createGame({
      parent: options.parent,
      viewport: {
        ...options.viewport,
        devicePixelRatio: capDevicePixelRatio(options.viewport.devicePixelRatio),
      },
    }).then((game) => {
      this.game = game;
      this.bootstrapping = null;

      game.events.once('ready', () => {
        useGameStore.getState().setRuntime({ isPhaserReady: true });
        gameBridge.emit('game:ready', { version: __APP_VERSION__ });
      });

      this.bindResize(options.viewport);
      return game;
    });

    return this.bootstrapping;
  }

  resize(viewport: ViewportInfo): void {
    if (!this.game) return;
    const dpr = capDevicePixelRatio(viewport.devicePixelRatio);
    this.game.scale.resize(
      Math.floor(viewport.width * dpr),
      Math.floor(viewport.height * dpr),
    );
    gameBridge.emit('game:resize', { width: viewport.width, height: viewport.height });
  }

  destroy(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    if (!this.game) return;
    this.game.destroy(true);
    this.game = null;
    this.bootstrapping = null;
    if (this.parent) {
      this.parent.replaceChildren();
    }
    this.parent = null;
    useGameStore.getState().setRuntime({ isPhaserReady: false });
    gameBridge.clear();
  }

  getGame(): import('phaser').Game | null {
    return this.game;
  }

  private bindResize(initialViewport: ViewportInfo): void {
    let base = initialViewport;
    this.resizeHandler = () => {
      const next: ViewportInfo = {
        ...base,
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: capDevicePixelRatio(window.devicePixelRatio),
      };
      base = next;
      useGameStore.getState().setViewport(next);
      this.resize(next);
    };
    window.addEventListener('resize', this.resizeHandler, { passive: true });
  }
}

export const phaserGame = new PhaserGameSingleton();
