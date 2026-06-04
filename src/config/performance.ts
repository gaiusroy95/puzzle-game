/** Central performance tuning — adjust per platform without scattering magic numbers. */

export const PERFORMANCE = {
  targetFps: 60,
  maxDevicePixelRatio: 2,
  resizeDebounceMs: 150,
  autoSaveDebounceMs: 2000,
  phaserLazyLoad: true,
} as const;

export const capDevicePixelRatio = (dpr: number): number =>
  Math.min(dpr, PERFORMANCE.maxDevicePixelRatio);

export const isProduction = import.meta.env.PROD;
export const isAnalyticsEnabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
