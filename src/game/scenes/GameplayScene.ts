import { BaseScene } from '@game/scenes/BaseScene';
import { progressionManager } from '@game/progression/ProgressionManager';
import { PuzzleViewHost } from '@game/puzzle/components/PuzzleViewHost';
import {
  GameStateController,
  InputManager,
  InteractionSystem,
  LevelManager,
  PuzzleManager,
} from '@game/puzzle/systems';
import { gameBridge } from '@services/GameBridge';
import { useNavigationStore } from '@store/navigationStore';
import { useSaveStore } from '@store/saveStore';
import { SceneKey } from '@shared/scenes';
import type { PuzzlePlayState, PuzzleWorldSnapshot } from '@shared/puzzle';

export interface GameplaySceneData {
  levelId?: string;
}

/**
 * Hosts the puzzle framework: logic systems + view sync layer.
 */
export class GameplayScene extends BaseScene {
  private puzzleManager!: PuzzleManager;
  private inputManager!: InputManager;
  private interaction!: InteractionSystem;
  private viewHost: PuzzleViewHost | null = null;
  private statusText!: Phaser.GameObjects.Text;
  private moveText!: Phaser.GameObjects.Text;
  private unsubscribers: Array<() => void> = [];
  private bridgeUnsubscribers: Array<() => void> = [];
  private winHandled = false;
  /** Invalidates in-flight async setup when the level changes or the scene shuts down. */
  private loadToken = 0;

  constructor() {
    super(SceneKey.Gameplay);
  }

  create(): void {
    super.create();
    this.emitPhase('playing');
    this.winHandled = false;
    this.loadToken += 1;
    const token = this.loadToken;

    const data = this.scene.settings.data as GameplaySceneData | undefined;
    const levelId = data?.levelId ?? 'level-01';
    const levelManager = new LevelManager();
    const stateController = new GameStateController();

    this.puzzleManager = new PuzzleManager(levelManager, stateController);
    this.inputManager = new InputManager();
    this.interaction = new InteractionSystem(this.puzzleManager);

    this.cameras.main.resetFX();
    this.createHud();
    this.bindBridge();
    this.bindSystems();
    void this.setupPuzzle(levelId, token);
  }

  update(): void {
    if (!this.sys) return;
    this.inputManager?.pollGamepad();
  }

  shutdown(): void {
    this.loadToken += 1;
    this.bridgeUnsubscribers.forEach((fn) => fn());
    this.bridgeUnsubscribers = [];
    if (this.sys) {
      this.time.removeAllEvents();
      this.tweens.killAll();
    }
    this.teardown();
  }

  private bindBridge(): void {
    this.bridgeUnsubscribers.push(
      gameBridge.on('game:load-level', ({ levelId }) => {
        void this.switchLevel(levelId);
      }),
    );
  }

  private async switchLevel(levelId: string): Promise<void> {
    if (!this.sys || !this.scene.isActive()) return;

    this.loadToken += 1;
    const token = this.loadToken;
    this.winHandled = false;
    this.inputManager.setEnabled(false);
    this.inputManager.detachScene();
    this.viewHost?.destroyAll();
    this.viewHost = null;

    this.statusText.setText('Loading level…');
    this.statusText.setColor('#ffffff');
    await this.setupPuzzle(levelId, token);
  }

  private createHud(): void {
    const { width } = this.cameras.main;
    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.statusText = this.add.text(width / 2, 24, 'Loading level…', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
    });
    this.statusText.setOrigin(0.5, 0);

    this.moveText = this.add.text(16, 24, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#a0a0b0',
    });

    this.add
      .text(width - 16, 24, 'Arrows / WASD — Move  |  R — Restart', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        color: '#666680',
      })
      .setOrigin(1, 0);
  }

  private isLoadCurrent(token: number): boolean {
    return token === this.loadToken && this.scene.isActive();
  }

  private async setupPuzzle(levelId: string, token: number): Promise<void> {
    try {
      const snapshot = await this.puzzleManager.loadLevel(levelId);
      if (!this.isLoadCurrent(token)) return;

      const level = this.puzzleManager.levels.getCurrent();
      if (!level) return;

      this.viewHost?.destroyAll();
      this.viewHost = new PuzzleViewHost(this, level.grid, snapshot.tiles);
      this.viewHost.buildFromSnapshot(snapshot);

      if (!this.isLoadCurrent(token)) {
        this.viewHost.destroyAll();
        this.viewHost = null;
        return;
      }

      const layout = this.viewHost.getLayout();
      this.inputManager.configureGridMapping(layout.originX, layout.originY, layout.cellSize);
      this.inputManager.attachScene(this);
      this.updateHud(snapshot, 'playing');
    } catch (error) {
      if (!this.isLoadCurrent(token)) return;
      const message = error instanceof Error ? error.message : 'Load failed';
      this.statusText.setText(message);
      this.statusText.setColor('#e74c3c');
      gameBridge.emit('game:error', { message });
    }
  }

  private bindSystems(): void {
    const unsubPuzzle = this.puzzleManager.onChange((snapshot) => {
      if (!this.sys) return;
      this.viewHost?.buildFromSnapshot(snapshot);
      this.updateHud(snapshot, this.puzzleManager.state.getState());
    });

    const unsubState = this.puzzleManager.state.onChange((state, outcome) => {
      if (!this.sys) return;
      const snapshot = this.puzzleManager.getSnapshot();
      if (snapshot) {
        this.updateHud(snapshot, state);
      }
      this.inputManager.setEnabled(state === 'playing');
      gameBridge.emit('puzzle:state', { state, reason: outcome.reason });

      if (state === 'won' && snapshot && !this.winHandled) {
        this.winHandled = true;
        void this.handleWin(snapshot);
      }
    });

    const unsubInput = this.inputManager.onAction((action) => {
      this.interaction.handle(action);
    });

    const unsubBridge = gameBridge.on('puzzle:command', (cmd) => {
      if (cmd.type === 'restart') {
        this.winHandled = false;
        this.puzzleManager.restart();
      }
    });

    this.unsubscribers.push(unsubPuzzle, unsubState, unsubInput, unsubBridge);
  }

  private async handleWin(snapshot: PuzzleWorldSnapshot): Promise<void> {
    const winToken = this.loadToken;
    const metadata = this.puzzleManager.levels.getCurrentMetadata();
    if (!metadata) return;

    const result = await useSaveStore.getState().recordLevelCompletion(metadata.id, snapshot.moveCount);
    if (winToken !== this.loadToken || !this.sys) return;

    const nextLevelId = progressionManager.getNextLevelId(metadata.id);

    const completion = {
      levelId: metadata.id,
      levelName: metadata.name,
      stars: result.stars,
      moves: snapshot.moveCount,
      score: result.score,
      nextLevelId,
      isNewBest: result.isNewBest,
    };

    gameBridge.emit('level:complete', completion);
    useNavigationStore.getState().showCompletion(completion);
  }

  private updateHud(snapshot: PuzzleWorldSnapshot, state: PuzzlePlayState): void {
    const level = this.puzzleManager.levels.getCurrent();
    const maxMoves = level?.limits?.maxMoves;
    this.moveText.setText(
      maxMoves != null
        ? `Moves: ${snapshot.moveCount} / ${maxMoves}`
        : `Moves: ${snapshot.moveCount}`,
    );

    switch (state) {
      case 'playing':
        this.statusText.setText(level?.name ?? 'Playing');
        this.statusText.setColor('#ffffff');
        break;
      case 'won':
        this.statusText.setText('Puzzle Complete!');
        this.statusText.setColor('#4ecca3');
        break;
      case 'lost':
        this.statusText.setText('Out of Moves — Press R to Restart');
        this.statusText.setColor('#e74c3c');
        break;
      case 'paused':
        this.statusText.setText('Paused');
        break;
      default:
        break;
    }
  }

  private teardown(): void {
    this.unsubscribers.forEach((fn) => fn());
    this.unsubscribers = [];
    this.inputManager.detachScene();
    this.viewHost?.destroyAll();
    this.viewHost = null;
    this.winHandled = false;
    gameBridge.emit('puzzle:state', { state: 'idle' });
  }
}
