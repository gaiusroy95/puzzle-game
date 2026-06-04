import { useGameBridge } from '@hooks/useGameBridge';
import { useGameStore } from '@store/gameStore';
import { useNavigationStore } from '@store/navigationStore';
import { useStatisticsStore } from '@store/statisticsStore';
import { feedbackService } from '@services/feedback/FeedbackService';
import { audioManager } from '@game/systems/AudioManager';

/**
 * Isolated bridge wiring — state updates here do not re-render GameContainer / Phaser host.
 */
export function GameBridgeListeners() {
  const setPhase = useGameStore((s) => s.setPhase);
  const setRuntime = useGameStore((s) => s.setRuntime);
  const setError = useGameStore((s) => s.setError);
  const setScreen = useNavigationStore((s) => s.setScreen);
  const showCompletion = useNavigationStore((s) => s.showCompletion);
  const recordWin = useStatisticsStore((s) => s.recordWin);
  const recordLoss = useStatisticsStore((s) => s.recordLoss);

  useGameBridge('game:phase', ({ phase }) => setPhase(phase));
  useGameBridge('game:error', ({ message }) => setError(message));
  useGameBridge('game:ready', () => setRuntime({ isPhaserReady: true }));
  useGameBridge('nav:screen', ({ screen }) => setScreen(screen));
  useGameBridge('level:complete', (data) => {
    recordWin(data.moves, data.stars);
    showCompletion(data);
    void audioManager.play('win');
    feedbackService.onWin();
  });
  useGameBridge('puzzle:state', ({ state }) => {
    if (state === 'lost') {
      recordLoss();
      void audioManager.play('lose');
      feedbackService.onLose();
    }
  });
  return null;
}
