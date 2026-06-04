import { memo } from 'react';
import { useNavigationStore } from '@store/navigationStore';
import { CompletionScreen } from './CompletionScreen';
import { LevelSelectScreen } from './LevelSelectScreen';
import { ProgressScreen } from './ProgressScreen';

function ContentOverlayComponent() {
  const screen = useNavigationStore((s) => s.screen);

  switch (screen) {
    case 'level-select':
      return <LevelSelectScreen />;
    case 'progress':
      return <ProgressScreen />;
    case 'completion':
      return <CompletionScreen />;
    default:
      return null;
  }
}

export const ContentOverlay = memo(ContentOverlayComponent);
