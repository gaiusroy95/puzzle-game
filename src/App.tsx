import { useEffect } from 'react';
import { GameShell } from '@ui/components/GameShell';
import { useSaveBootstrap } from '@hooks/useSaveBootstrap';
import { useBackendSession } from '@hooks/useBackendSession';
import { useViewport } from '@hooks/useViewport';
import { useGameStore } from '@store/gameStore';
import { useSaveStore } from '@store/saveStore';

export default function App() {
  useViewport();
  const { ready, recoveryMessage } = useSaveBootstrap();
  useBackendSession(ready);

  const setOnline = useGameStore((s) => s.setOnline);
  const ensureDefaults = useSaveStore((s) => s.ensureDefaults);

  useEffect(() => {
    if (ready) ensureDefaults();
  }, [ready, ensureDefaults]);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [setOnline]);

  return (
    <main className="app-root">
      {recoveryMessage && (
        <div className="app-recovery-banner" role="status">
          {recoveryMessage}
        </div>
      )}
      {ready && <GameShell />}
    </main>
  );
}
