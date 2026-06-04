import type { ProfileResponse } from '@contracts/api';
import type { PlayerProfile } from '@contracts/profile';
import { authApi } from './authApi';
import { apiClient } from './ApiClient';

export const profileApi = {
  get: (playerId: string): Promise<ProfileResponse> =>
    apiClient.get<ProfileResponse>(`/profile/${playerId}`, {
      authToken: authApi.getStoredToken(),
    }),

  update: (playerId: string, profile: Partial<PlayerProfile>): Promise<ProfileResponse> =>
    apiClient.put<ProfileResponse>(`/profile/${playerId}`, profile, {
      authToken: authApi.getStoredToken(),
    }),
};
