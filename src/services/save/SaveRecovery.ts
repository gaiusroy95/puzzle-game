import type { SaveBackupEntry, SaveEnvelope, SaveRecoveryState } from '@contracts/save';
import { saveSerializer } from './SaveSerializer';
import { saveValidator } from './SaveValidator';
import type { SaveStorageAdapter } from './SaveStorageAdapter';

const PRIMARY_KEY = 'puzzle-save-primary';
const BACKUP_PREFIX = 'puzzle-save-backup-';
const MAX_BACKUPS = 5;

export class SaveRecovery {
  constructor(private readonly storage: SaveStorageAdapter) {}

  loadPrimary(): SaveEnvelope | null {
    const raw = this.storage.read(PRIMARY_KEY);
    if (!raw) return null;
    const envelope = saveSerializer.parse(raw);
    if (!envelope) return null;
    if (!saveValidator.isEnvelopeValid(envelope)) return null;
    return envelope;
  }

  loadWithRecovery(): SaveRecoveryState {
    const primary = this.loadPrimary();
    if (primary) {
      return { backups: this.listBackups(), lastValidEnvelope: primary, lastError: null };
    }

    const backups = this.listBackups();
    for (const backup of backups) {
      if (saveValidator.isEnvelopeValid(backup.envelope)) {
        this.storage.write(PRIMARY_KEY, saveSerializer.serialize(backup.envelope));
        return {
          backups,
          lastValidEnvelope: backup.envelope,
          lastError: 'Primary save corrupted — restored from backup',
        };
      }
    }

    return {
      backups,
      lastValidEnvelope: null,
      lastError: 'No valid save found',
    };
  }

  writePrimary(envelope: SaveEnvelope): void {
    if (!saveValidator.isEnvelopeValid(envelope)) {
      throw new Error('Refusing to write invalid save envelope');
    }
    const existing = this.loadPrimary();
    if (existing) {
      this.pushBackup(existing);
    }
    this.storage.write(PRIMARY_KEY, saveSerializer.serialize(envelope));
  }

  pushBackup(envelope: SaveEnvelope): void {
    const entry: SaveBackupEntry = {
      id: `backup-${Date.now()}`,
      envelope,
      createdAt: new Date().toISOString(),
    };
    this.storage.write(`${BACKUP_PREFIX}${entry.id}`, saveSerializer.serialize(entry.envelope));

    const keys = this.storage
      .keys(BACKUP_PREFIX)
      .sort()
      .reverse();
    keys.slice(MAX_BACKUPS).forEach((key) => this.storage.remove(key));
  }

  listBackups(): SaveBackupEntry[] {
    return this.storage
      .keys(BACKUP_PREFIX)
      .map((key) => {
        const raw = this.storage.read(key);
        if (!raw) return null;
        const envelope = saveSerializer.parse(raw);
        if (!envelope) return null;
        return {
          id: key.replace(BACKUP_PREFIX, ''),
          envelope,
          createdAt: envelope.savedAt,
        };
      })
      .filter((e): e is SaveBackupEntry => e !== null)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  restoreBackup(backupId: string): SaveEnvelope | null {
    const raw = this.storage.read(`${BACKUP_PREFIX}${backupId}`);
    if (!raw) return null;
    const envelope = saveSerializer.parse(raw);
    if (!envelope || !saveValidator.isEnvelopeValid(envelope)) return null;
    this.writePrimary(envelope);
    return envelope;
  }
}
