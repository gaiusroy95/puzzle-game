import type { PuzzleOutcome, PuzzlePlayState } from '@shared/puzzle';

type StateListener = (state: PuzzlePlayState, outcome: PuzzleOutcome) => void;

/**
 * Puzzle session state machine — independent of Phaser scene lifecycle.
 */
export class GameStateController {
  private state: PuzzlePlayState = 'idle';
  private readonly listeners = new Set<StateListener>();

  getState(): PuzzlePlayState {
    return this.state;
  }

  start(): void {
    this.transition('playing');
  }

  pause(): void {
    if (this.state === 'playing') {
      this.transition('paused');
    }
  }

  resume(): void {
    if (this.state === 'paused') {
      this.transition('playing');
    }
  }

  applyOutcome(outcome: PuzzleOutcome): void {
    if (outcome.state === 'playing' && this.state === 'idle') {
      this.transition('playing', outcome);
      return;
    }
    if (outcome.state !== this.state) {
      this.transition(outcome.state, outcome);
    }
  }

  reset(): void {
    this.transition('playing', { state: 'playing', reason: 'reset' });
  }

  onChange(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private transition(state: PuzzlePlayState, outcome: PuzzleOutcome = { state }): void {
    this.state = state;
    this.listeners.forEach((listener) => listener(state, outcome));
  }
}
