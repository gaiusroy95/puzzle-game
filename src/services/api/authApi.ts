import type { GuestAuthResponse } from '@contracts/api';
import { apiClient } from './ApiClient';

const AUTH_TOKEN_KEY = 'puzzle-auth-token';

export const authApi = {
  createGuestSession: (): Promise<GuestAuthResponse> =>
    apiClient.post<GuestAuthResponse>('/auth/guest'),

  getStoredToken: (): string | null => localStorage.getItem(AUTH_TOKEN_KEY),

  setStoredToken: (token: string): void => localStorage.setItem(AUTH_TOKEN_KEY, token),

  clearToken: (): void => localStorage.removeItem(AUTH_TOKEN_KEY),
};
