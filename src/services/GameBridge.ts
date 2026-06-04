import type { CompletionScreenData, OverlayScreen } from '@shared/content';
import type { GamePhase } from '@shared/game';
import type { PuzzlePlayState } from '@shared/puzzle';
import type { SceneKey } from '@shared/scenes';

export type GameBridgeEventMap = {
  'game:ready': { version: string };
  'game:phase': { phase: GamePhase };
  'game:scene': { scene: SceneKey };
  'game:error': { message: string };
  /** Swap level without restarting GameplayScene (avoids Phaser scene teardown races). */
  'game:load-level': { levelId: string };
  'game:resize': { width: number; height: number };
  'puzzle:state': { state: PuzzlePlayState; reason?: string };
  'puzzle:command': { type: 'restart' };
  'nav:screen': { screen: OverlayScreen };
  'level:complete': CompletionScreenData;
  'feedback:win': Record<string, never>;
  'feedback:lose': Record<string, never>;
};

type GameBridgeListener<K extends keyof GameBridgeEventMap> = (
  payload: GameBridgeEventMap[K],
) => void;

/**
 * Typed event bus between Phaser and React.
 * Decouples engine lifecycle from UI without prop drilling or global window hooks.
 */
type BridgeListener = (payload: GameBridgeEventMap[keyof GameBridgeEventMap]) => void;

export class GameBridge {
  private listeners = new Map<keyof GameBridgeEventMap, Set<BridgeListener>>();

  on<K extends keyof GameBridgeEventMap>(
    event: K,
    listener: GameBridgeListener<K>,
  ): () => void {
    const bucket = this.listeners.get(event) ?? new Set<BridgeListener>();
    const wrapped: BridgeListener = (payload) =>
      listener(payload as GameBridgeEventMap[K]);
    bucket.add(wrapped);
    this.listeners.set(event, bucket);
    return () => bucket.delete(wrapped);
  }

  emit<K extends keyof GameBridgeEventMap>(event: K, payload: GameBridgeEventMap[K]): void {
    const bucket = this.listeners.get(event);
    if (!bucket) return;
    bucket.forEach((listener) => listener(payload));
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const gameBridge = new GameBridge();
