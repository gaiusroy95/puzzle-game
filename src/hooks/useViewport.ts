import { useEffect } from 'react';
import { capDevicePixelRatio, PERFORMANCE } from '@/config/performance';
import { useGameStore } from '@store/gameStore';
import type { DeviceClass, ViewportInfo } from '@shared/game';
import { debounce } from '@/utils/debounce';

const resolveDeviceClass = (width: number): DeviceClass => {
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

const readViewport = (): ViewportInfo => ({
  width: window.innerWidth,
  height: window.innerHeight,
  devicePixelRatio: capDevicePixelRatio(window.devicePixelRatio),
  deviceClass: resolveDeviceClass(window.innerWidth),
});

/** Debounced viewport tracking — limits React updates during window drag-resize. */
export function useViewport(): void {
  const setViewport = useGameStore((s) => s.setViewport);

  useEffect(() => {
    const update = debounce(() => setViewport(readViewport()), PERFORMANCE.resizeDebounceMs);
    setViewport(readViewport());
    window.addEventListener('resize', update, { passive: true });
    return () => {
      update.cancel();
      window.removeEventListener('resize', update);
    };
  }, [setViewport]);
}
