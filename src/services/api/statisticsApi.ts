import type { StatisticsResponse } from '@contracts/api';
import type { PlayerStatistics } from '@contracts/statistics';
import { authApi } from './authApi';
import { apiClient } from './ApiClient';

export const statisticsApi = {
  get: (playerId: string): Promise<StatisticsResponse> =>
    apiClient.get<StatisticsResponse>(`/statistics/${playerId}`, {
      authToken: authApi.getStoredToken(),
    }),

  update: (playerId: string, stats: Partial<PlayerStatistics>): Promise<StatisticsResponse> =>
    apiClient.put<StatisticsResponse>(`/statistics/${playerId}`, stats, {
      authToken: authApi.getStoredToken(),
    }),
};
