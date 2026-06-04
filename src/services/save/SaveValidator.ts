import {
  SAVE_DATA_VERSION,
  type SaveEnvelope,
  type SavePayload,
  type SaveSlotData,
} from '@contracts/save';
import { verifyChecksum } from '@contracts/utils/checksum';

export interface SaveValidationIssue {
  path: string;
  message: string;
}

export interface SaveValidationResult {
  valid: boolean;
  issues: SaveValidationIssue[];
}

export class SaveValidator {
  validatePayload(payload: unknown): SaveValidationResult {
    const issues: SaveValidationIssue[] = [];

    if (!payload || typeof payload !== 'object') {
      return { valid: false, issues: [{ path: '', message: 'Payload must be an object' }] };
    }

    const data = payload as Record<string, unknown>;

    if (typeof data.version !== 'number') {
      issues.push({ path: 'version', message: 'Version required' });
    } else if (data.version > SAVE_DATA_VERSION) {
      issues.push({ path: 'version', message: 'Unsupported save version' });
    }

    if (typeof data.activeSlotId !== 'number') {
      issues.push({ path: 'activeSlotId', message: 'activeSlotId required' });
    }

    if (!Array.isArray(data.slots)) {
      issues.push({ path: 'slots', message: 'slots must be an array' });
    } else {
      data.slots.forEach((slot, i) => this.validateSlot(slot, `slots[${i}]`, issues));
    }

    return { valid: issues.length === 0, issues };
  }

  validateEnvelope(envelope: unknown): SaveValidationResult {
    const issues: SaveValidationIssue[] = [];

    if (!envelope || typeof envelope !== 'object') {
      return { valid: false, issues: [{ path: '', message: 'Envelope must be an object' }] };
    }

    const env = envelope as Record<string, unknown>;

    if (typeof env.checksum !== 'string') issues.push({ path: 'checksum', message: 'Missing checksum' });
    if (typeof env.savedAt !== 'string') issues.push({ path: 'savedAt', message: 'Missing savedAt' });
    if (typeof env.source !== 'string') issues.push({ path: 'source', message: 'Missing source' });

    const payloadResult = this.validatePayload(env.payload);
    issues.push(...payloadResult.issues.map((i) => ({ ...i, path: `payload.${i.path}` })));

    if (issues.length === 0 && typeof env.checksum === 'string' && env.payload) {
      const canonical = JSON.stringify(env.payload);
      if (!verifyChecksum(canonical, env.checksum)) {
        issues.push({ path: 'checksum', message: 'Checksum mismatch — save may be corrupted' });
      }
    }

    return { valid: issues.length === 0, issues };
  }

  sanitizePayload(payload: SavePayload): SavePayload {
    const result = this.validatePayload(payload);
    if (!result.valid) {
      throw new Error(`Cannot sanitize invalid save: ${result.issues[0]?.message}`);
    }
    return JSON.parse(JSON.stringify(payload)) as SavePayload;
  }

  isEnvelopeValid(envelope: SaveEnvelope): boolean {
    return this.validateEnvelope(envelope).valid;
  }

  private validateSlot(slot: unknown, path: string, issues: SaveValidationIssue[]): void {
    if (!slot || typeof slot !== 'object') {
      issues.push({ path, message: 'Slot must be an object' });
      return;
    }
    const s = slot as Partial<SaveSlotData>;
    if (typeof s.slotId !== 'number') issues.push({ path: `${path}.slotId`, message: 'Required' });
    if (typeof s.label !== 'string') issues.push({ path: `${path}.label`, message: 'Required' });
    if (!s.progress || typeof s.progress !== 'object') {
      issues.push({ path: `${path}.progress`, message: 'Required' });
    }
  }
}

export const saveValidator = new SaveValidator();
