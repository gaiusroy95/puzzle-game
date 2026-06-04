import { useEffect, useState } from 'react';
import { useSaveStore } from '@store/saveStore';
import { saveService } from '@services/save';

/**
 * Bootstraps save recovery on app start and wires beforeunload flush.
 */
export function useSaveBootstrap(): {
  ready: boolean;
  recoveryMessage: string | null;
} {
  const hydrateFromRecovery = useSaveStore((s) => s.hydrateFromRecovery);
  const [ready, setReady] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);

  useEffect(() => {
    const message = hydrateFromRecovery();
    setRecoveryMessage(message);
    setReady(true);

    const onUnload = () => {
      void saveService.flush();
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [hydrateFromRecovery]);

  useEffect(() => {
    return saveService.onChange((state) => {
      if (state.recoveryMessage) setRecoveryMessage(state.recoveryMessage);
    });
  }, []);

  return { ready, recoveryMessage };
}
