import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createGuestProfile, type PlayerProfile } from '@contracts/profile';

const createPlayerId = (): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `guest-${Date.now()}`;

interface ProfileActions {
  updateDisplayName: (displayName: string) => void;
  touch: () => void;
}

export type ProfileStore = PlayerProfile & ProfileActions;

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => {
      const id = createPlayerId();
      return {
        ...createGuestProfile(id),
        updateDisplayName: (displayName) =>
          set({
            displayName: displayName.trim().slice(0, 32) || 'Guest',
            updatedAt: new Date().toISOString(),
          }),
        touch: () => set({ updatedAt: new Date().toISOString() }),
      };
    },
    {
      name: 'puzzle-game-profile',
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<PlayerProfile>),
        playerId: (persisted as PlayerProfile)?.playerId ?? current.playerId,
      }),
    },
  ),
);
