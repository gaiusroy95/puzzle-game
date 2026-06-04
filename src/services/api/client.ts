export { apiClient, ApiClient, ApiError } from './ApiClient';
export { authApi } from './authApi';
export { saveApi } from './saveApi';
export { profileApi } from './profileApi';
export { statisticsApi } from './statisticsApi';

import { apiClient } from './ApiClient';

export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  return apiClient.get<{ status: string; timestamp: string }>('/health');
}
