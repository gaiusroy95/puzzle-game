import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { GamePhase, GameRuntimeFlags, ViewportInfo } from '@shared/game';
import type { GlobalGameState } from '@shared/state';

interface GameStoreState extends GlobalGameState {
  runtime: GameRuntimeFlags;
  viewport: ViewportInfo | null;
}

interface GameActions {
  setPhase: (phase: GamePhase) => void;
  setOnline: (isOnline: boolean) => void;
  setError: (message: string | null) => void;
  setRuntime: (partial: Partial<GameRuntimeFlags>) => void;
  setViewport: (viewport: ViewportInfo) => void;
}

export type GameStore = GameStoreState & GameActions;

const createSessionId = (): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `session-${Date.now()}`;

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set) => ({
    phase: 'boot',
    sessionId: createSessionId(),
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastError: null,
    runtime: {
      isPhaserReady: false,
      isPaused: false,
      targetFps: 60,
    },
    viewport: null,
    setPhase: (phase) => set({ phase }),
    setOnline: (isOnline) => set({ isOnline }),
    setError: (lastError) => set({ lastError }),
    setRuntime: (partial) =>
      set((state) => ({
        runtime: { ...state.runtime, ...partial },
      })),
    setViewport: (viewport) => set({ viewport }),
  })),
);
