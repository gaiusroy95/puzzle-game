import { useEffect, useState } from 'react';
import { authApi } from '@services/api/authApi';
import { profileApi } from '@services/api/profileApi';
import { useProfileStore } from '@store/profileStore';
import { syncStatisticsPlayerId } from '@store/statisticsStore';
import { ApiError } from '@services/api/ApiClient';

/**
 * Optional guest session for cloud save / profile API (when server is online).
 */
export function useBackendSession(enabled = true): { online: boolean; syncing: boolean } {
  const playerId = useProfileStore((s) => s.playerId);
  const [online, setOnline] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    syncStatisticsPlayerId(playerId);
  }, [playerId]);

  useEffect(() => {
    if (!enabled) return;

    const connect = async () => {
      setSyncing(true);
      try {
        let token = authApi.getStoredToken();
        if (!token) {
          const session = await authApi.createGuestSession();
          authApi.setStoredToken(session.token);
          token = session.token;
        }
        await profileApi.get(playerId);
        setOnline(true);
      } catch (error) {
        if (error instanceof ApiError && error.status >= 500) {
          setOnline(false);
        } else if (!navigator.onLine) {
          setOnline(false);
        } else {
          setOnline(false);
        }
      } finally {
        setSyncing(false);
      }
    };

    void connect();
  }, [enabled, playerId]);

  return { online, syncing };
}
