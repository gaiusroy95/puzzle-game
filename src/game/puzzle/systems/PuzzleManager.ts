import { audioManager } from '@game/systems/AudioManager';
import { analyticsService } from '@services/analytics/AnalyticsService';
import type { Direction, LevelDefinition, PuzzleWorldSnapshot } from '@shared/puzzle';
import { PuzzleWorld } from '@game/puzzle/core/PuzzleWorld';
import { ruleSetRegistry } from '@game/puzzle/rules/RuleSetRegistry';
import type { IPuzzleRuleSet } from '@game/puzzle/rules/IPuzzleRuleSet';
import { GameStateController } from './GameStateController';
import { LevelManager } from './LevelManager';
import { WinConditionSystem } from './WinConditionSystem';

type PuzzleListener = (snapshot: PuzzleWorldSnapshot) => void;

/**
 * Central puzzle orchestrator — wires world simulation, rules, and outcomes.
 */
export class PuzzleManager {
  private world: PuzzleWorld | null = null;
  private ruleSet: IPuzzleRuleSet | null = null;
  private history: PuzzleWorldSnapshot[] = [];
  private readonly winSystem = new WinConditionSystem();
  private readonly listeners = new Set<PuzzleListener>();

  constructor(
    readonly levels: LevelManager,
    readonly state: GameStateController,
  ) {}

  async loadLevel(levelId: string): Promise<PuzzleWorldSnapshot> {
    const level = await this.levels.load(levelId);
    this.bootstrapWorld(level);
    const snapshot = this.world!.snapshot();
    this.levels.setInitialSnapshot(snapshot);
    this.state.start();
    analyticsService.track('level_start', { levelId });
    this.notify();
    return snapshot;
  }

  getWorld(): PuzzleWorld | null {
    return this.world;
  }

  getSnapshot(): PuzzleWorldSnapshot | null {
    return this.world?.snapshot() ?? null;
  }

  tryMove(direction: Direction): boolean {
    if (!this.world || !this.ruleSet || this.state.getState() !== 'playing') {
      return false;
    }

    this.history.push(this.world.snapshot());
    if (this.history.length > 50) {
      this.history.shift();
    }

    const result = this.ruleSet.tryMove(this.world, direction);
    if (!result.success) {
      this.history.pop();
      return false;
    }

    this.evaluateOutcome();
    void audioManager.play('move');
    this.notify();
    return true;
  }

  restart(): void {
    const initial = this.levels.getInitialSnapshot();
    const level = this.levels.getCurrent();
    if (!level) return;

    if (initial) {
      this.world = PuzzleWorld.fromSnapshot(level, initial);
    } else {
      this.bootstrapWorld(level);
    }

    this.history = [];
    this.state.reset();
    this.notify();
  }

  undo(): void {
    const previous = this.history.pop();
    const level = this.levels.getCurrent();
    if (!previous || !level) return;

    this.world = PuzzleWorld.fromSnapshot(level, previous);
    if (this.state.getState() !== 'playing') {
      this.state.reset();
    }
    this.notify();
  }

  pause(): void {
    this.state.pause();
  }

  onChange(listener: PuzzleListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private bootstrapWorld(level: LevelDefinition): void {
    this.ruleSet = ruleSetRegistry.resolve(level);
    this.world = new PuzzleWorld(level);
    this.ruleSet.validate(this.world);
    this.history = [];
  }

  private evaluateOutcome(): void {
    if (!this.world) return;
    const level = this.levels.getCurrent();
    if (!level) return;

    const evaluation = this.winSystem.evaluate(this.world, level);
    if (evaluation.state !== 'playing') {
      this.state.applyOutcome({ state: evaluation.state, reason: evaluation.reason });
    }
  }

  private notify(): void {
    const snapshot = this.getSnapshot();
    if (snapshot) {
      this.listeners.forEach((listener) => listener(snapshot));
    }
  }
}
