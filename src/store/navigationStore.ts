import { create } from 'zustand';
import type { CompletionScreenData, OverlayScreen } from '@shared/content';

interface NavigationState {
  screen: OverlayScreen;
  completion: CompletionScreenData | null;
  setScreen: (screen: OverlayScreen) => void;
  showCompletion: (data: CompletionScreenData) => void;
  close: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  screen: 'none',
  completion: null,
  setScreen: (screen) =>
    set((state) => ({
      screen,
      completion: screen === 'completion' ? state.completion : null,
    })),
  showCompletion: (completion) => set({ screen: 'completion', completion }),
  close: () => set({ screen: 'none', completion: null }),
}));
