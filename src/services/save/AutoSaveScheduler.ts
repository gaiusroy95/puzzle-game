type SaveCallback = () => void | Promise<void>;

/**
 * Debounced auto-save — avoids hammering storage during rapid state updates.
 */
export class AutoSaveScheduler {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private enabled = true;

  constructor(
    private readonly delayMs: number,
    private readonly onSave: SaveCallback,
  ) {}

  schedule(): void {
    if (!this.enabled) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.onSave();
    }, this.delayMs);
  }

  flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    return Promise.resolve(this.onSave());
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled && this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  destroy(): void {
    this.setEnabled(false);
  }
}
