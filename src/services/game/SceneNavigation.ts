import { phaserGame } from '@game/PhaserGame';
import { gameBridge } from '@services/GameBridge';
import { SceneKey } from '@shared/scenes';

export const startLevel = (levelId: string): void => {
  const game = phaserGame.getGame();
  if (!game) return;

  // Gameplay is already running (e.g. "Next Level") — reload in-scene instead of scene.start()
  if (game.scene.isActive(SceneKey.Gameplay)) {
    gameBridge.emit('game:load-level', { levelId });
    return;
  }

  game.scene.start(SceneKey.Gameplay, { levelId });
};

export const goToMainMenu = (): void => {
  const game = phaserGame.getGame();
  if (!game) return;
  game.scene.start(SceneKey.MainMenu);
};
