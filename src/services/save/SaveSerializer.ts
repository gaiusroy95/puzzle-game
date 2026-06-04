import { computeChecksum } from '@contracts/utils/checksum';
import type { SaveEnvelope, SavePayload, SaveSource } from '@contracts/save';
import { SAVE_DATA_VERSION } from '@contracts/save';

export class SaveSerializer {
  createEnvelope(payload: SavePayload, source: SaveSource): SaveEnvelope {
    const normalized: SavePayload = {
      ...payload,
      version: payload.version ?? SAVE_DATA_VERSION,
    };
    const canonical = JSON.stringify(normalized);
    return {
      version: SAVE_DATA_VERSION,
      checksum: computeChecksum(canonical),
      savedAt: new Date().toISOString(),
      source,
      payload: normalized,
    };
  }

  serialize(envelope: SaveEnvelope): string {
    return JSON.stringify(envelope);
  }

  parse(raw: string): SaveEnvelope | null {
    try {
      return JSON.parse(raw) as SaveEnvelope;
    } catch {
      return null;
    }
  }
}

export const saveSerializer = new SaveSerializer();
