import { analyticsService } from '@services/analytics/AnalyticsService';
import type { SaveEnvelope, SavePayload, SaveRecoveryState, SaveSource } from '@contracts/save';
import { AutoSaveScheduler } from './AutoSaveScheduler';
import { LocalStorageAdapter } from './SaveStorageAdapter';
import { SaveRecovery } from './SaveRecovery';
import { saveSerializer } from './SaveSerializer';
import { saveValidator } from './SaveValidator';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface SaveServiceState {
  status: SaveStatus;
  lastSavedAt: string | null;
  lastSource: SaveSource | null;
  recoveryMessage: string | null;
}

type SaveListener = (state: SaveServiceState) => void;

/**
 * Central save orchestration: local persistence, auto/manual saves, recovery.
 */
export class SaveService {
  private recovery: SaveRecovery;
  private autoSave: AutoSaveScheduler;
  private state: SaveServiceState = {
    status: 'idle',
    lastSavedAt: null,
    lastSource: null,
    recoveryMessage: null,
  };
  private listeners = new Set<SaveListener>();
  private payloadProvider: (() => SavePayload) | null = null;

  constructor(storage = new LocalStorageAdapter()) {
    this.recovery = new SaveRecovery(storage);
    this.autoSave = new AutoSaveScheduler(2000, async () => {
      await this.save('auto');
    });
  }

  setPayloadProvider(provider: () => SavePayload): void {
    this.payloadProvider = provider;
  }

  initialize(): SaveRecoveryState {
    const result = this.recovery.loadWithRecovery();
    this.patchState({
      recoveryMessage: result.lastError,
      lastSavedAt: result.lastValidEnvelope?.savedAt ?? null,
      lastSource: result.lastValidEnvelope?.source ?? null,
    });
    return result;
  }

  getRecoveredPayload(): SavePayload | null {
    const envelope = this.recovery.loadPrimary();
    return envelope?.payload ?? null;
  }

  scheduleAutoSave(): void {
    this.autoSave.schedule();
  }

  async saveManual(): Promise<boolean> {
    return this.save('manual');
  }

  async save(source: SaveSource): Promise<boolean> {
    if (!this.payloadProvider) return false;

    this.patchState({ status: 'saving' });

    try {
      const raw = this.payloadProvider();
      const payload = saveValidator.sanitizePayload(raw);
      const envelope = saveSerializer.createEnvelope(payload, source);
      this.recovery.writePrimary(envelope);
      this.patchState({
        status: 'saved',
        lastSavedAt: envelope.savedAt,
        lastSource: source,
        recoveryMessage: null,
      });
      analyticsService.track(source === 'manual' ? 'save_manual' : 'save_auto');
      return true;
    } catch (error) {
      this.patchState({
        status: 'error',
        recoveryMessage: error instanceof Error ? error.message : 'Save failed',
      });
      return false;
    }
  }

  async flush(): Promise<void> {
    await this.autoSave.flush();
  }

  exportEnvelope(): SaveEnvelope | null {
    if (!this.payloadProvider) return null;
    try {
      const payload = saveValidator.sanitizePayload(this.payloadProvider());
      return saveSerializer.createEnvelope(payload, 'manual');
    } catch {
      return null;
    }
  }

  restoreBackup(backupId: string): SavePayload | null {
    const envelope = this.recovery.restoreBackup(backupId);
    return envelope?.payload ?? null;
  }

  onChange(listener: SaveListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState(): SaveServiceState {
    return { ...this.state };
  }

  destroy(): void {
    this.autoSave.destroy();
  }

  private patchState(partial: Partial<SaveServiceState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l(this.state));
  }
}

export const saveService = new SaveService();
