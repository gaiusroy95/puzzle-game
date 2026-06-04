export interface PlayerProfile {
  playerId: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  avatarId: string | null;
  locale: string;
  /** Reserved for authenticated accounts. */
  authProvider: 'guest' | 'email' | 'oauth' | null;
  externalAuthId: string | null;
}

export const createGuestProfile = (playerId: string): PlayerProfile => ({
  playerId,
  displayName: 'Guest',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  avatarId: null,
  locale: 'en',
  authProvider: 'guest',
  externalAuthId: null,
});
