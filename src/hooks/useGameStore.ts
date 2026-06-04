import { useGameStore } from '@store/gameStore';
import type { GamePhase } from '@shared/game';

/** Selector hooks minimize React re-renders when unrelated store fields change. */
export const useGamePhase = (): GamePhase => useGameStore((s) => s.phase);

export const useIsPhaserReady = (): boolean =>
  useGameStore((s) => s.runtime.isPhaserReady);

export const useGameSessionId = (): string => useGameStore((s) => s.sessionId);
