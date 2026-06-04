import type { SaveEnvelope } from '../../shared/types/save.js';
import { validateSaveEnvelope } from '../validation/saveValidation.js';
import { HttpError } from '../middleware/errorHandler.js';
import { FileStorage } from '../storage/FileStorage.js';

export interface StoredSave {
  playerId: string;
  slotId: number;
  envelope: SaveEnvelope;
  syncedAt: string;
}

export class SaveRepository {
  constructor(private readonly storage: FileStorage) {}

  async get(playerId: string, slotId: number): Promise<StoredSave | null> {
    return this.storage.readJson<StoredSave>(this.path(playerId, slotId));
  }

  async put(playerId: string, slotId: number, envelope: unknown): Promise<StoredSave> {
    const issues = validateSaveEnvelope(envelope);
    if (issues.length > 0) {
      throw new HttpError('Invalid save envelope', 400, 'VALIDATION_ERROR', issues);
    }
    const validEnvelope = envelope as SaveEnvelope;
    const record: StoredSave = {
      playerId,
      slotId,
      envelope: validEnvelope,
      syncedAt: new Date().toISOString(),
    };
    await this.storage.writeJson(this.path(playerId, slotId), record);
    return record;
  }

  private path(playerId: string, slotId: number): string {
    const safeId = playerId.replace(/[^a-zA-Z0-9-_]/g, '');
    return `saves/${safeId}/slot-${slotId}.json`;
  }
}
