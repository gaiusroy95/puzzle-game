export type GamePhase = 'boot' | 'loading' | 'menu' | 'playing' | 'paused';

export type DeviceClass = 'desktop' | 'tablet' | 'mobile';

export interface ViewportInfo {
  width: number;
  height: number;
  devicePixelRatio: number;
  deviceClass: DeviceClass;
}

export interface GameRuntimeFlags {
  isPhaserReady: boolean;
  isPaused: boolean;
  targetFps: number;
}
