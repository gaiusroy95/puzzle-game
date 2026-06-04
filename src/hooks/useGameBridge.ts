import { useEffect, useRef } from 'react';
import { gameBridge, type GameBridgeEventMap } from '@services/GameBridge';

/**
 * Subscribe to Phaser events without causing parent re-renders.
 * Callback ref pattern keeps latest handler without resubscribing every render.
 */
export function useGameBridge<K extends keyof GameBridgeEventMap>(
  event: K,
  handler: (payload: GameBridgeEventMap[K]) => void,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    return gameBridge.on(event, (payload) => handlerRef.current(payload));
  }, [event]);
}
