import type Phaser from 'phaser';
import type { Direction, GridPosition, InputAction } from '@shared/puzzle';

type InputListener = (action: InputAction) => void;

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
};

/**
 * Normalizes keyboard, mouse, and future gamepad input into InputAction events.
 */
export class InputManager {
  private readonly listeners = new Set<InputListener>();
  private enabled = true;
  private gridOrigin: { x: number; y: number } = { x: 0, y: 0 };
  private cellSize = 48;
  private unbindScene: (() => void) | null = null;

  configureGridMapping(originX: number, originY: number, cellSize: number): void {
    this.gridOrigin = { x: originX, y: originY };
    this.cellSize = cellSize;
  }

  attachScene(scene: Phaser.Scene): void {
    this.detachScene();
    this.unbindScene = this.bindSceneInput(scene);
  }

  detachScene(): void {
    this.unbindScene?.();
    this.unbindScene = null;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  onAction(listener: InputListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Gamepad polling hook — call from scene update when pads are connected. */
  pollGamepad(): void {
    const pads = navigator.getGamepads?.() ?? [];
    const pad = pads[0];
    if (!pad || !this.enabled) return;

    const axisX = pad.axes[0] ?? 0;
    const axisY = pad.axes[1] ?? 0;
    const threshold = 0.55;

    if (axisY < -threshold) this.emit({ type: 'move', device: 'gamepad', direction: 'up' });
    else if (axisY > threshold) this.emit({ type: 'move', device: 'gamepad', direction: 'down' });
    else if (axisX < -threshold) this.emit({ type: 'move', device: 'gamepad', direction: 'left' });
    else if (axisX > threshold) this.emit({ type: 'move', device: 'gamepad', direction: 'right' });

    if (pad.buttons[0]?.pressed) {
      this.emit({ type: 'interact', device: 'gamepad' });
    }
    if (pad.buttons[1]?.pressed) {
      this.emit({ type: 'restart', device: 'gamepad' });
    }
  }

  private bindSceneInput(scene: Phaser.Scene): () => void {
    const keyboard = scene.input.keyboard;
    if (!keyboard) return () => {};

    const onKeyDown = (event: KeyboardEvent) => {
      if (!this.enabled) return;

      if (event.code === 'KeyR') {
        this.emit({ type: 'restart', device: 'keyboard' });
        return;
      }

      const direction = KEY_TO_DIRECTION[event.code];
      if (direction) {
        this.emit({ type: 'move', device: 'keyboard', direction });
      }
    };

    const onPointerDown = (pointer: Phaser.Input.Pointer) => {
      if (!this.enabled) return;
      const gridPosition = this.pointerToGrid(pointer.worldX, pointer.worldY);
      if (gridPosition) {
        this.emit({ type: 'interact', device: 'mouse', gridPosition });
      }
    };

    keyboard.on('keydown', onKeyDown);
    scene.input.on('pointerdown', onPointerDown);

    return () => {
      keyboard.off('keydown', onKeyDown);
      scene.input.off('pointerdown', onPointerDown);
    };
  }

  private pointerToGrid(worldX: number, worldY: number): GridPosition | null {
    const x = Math.floor((worldX - this.gridOrigin.x) / this.cellSize);
    const y = Math.floor((worldY - this.gridOrigin.y) / this.cellSize);
    if (x < 0 || y < 0) return null;
    return { x, y };
  }

  private emit(partial: Omit<InputAction, 'timestamp'>): void {
    const action: InputAction = { ...partial, timestamp: Date.now() };
    this.listeners.forEach((listener) => listener(action));
  }
}
