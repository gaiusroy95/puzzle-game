import { SAVE_DATA_VERSION, type SaveEnvelope, type SavePayload } from '../../shared/types/save.js';
import { verifyChecksum } from '../../shared/utils/checksum.js';

export interface ValidationIssue {
  path: string;
  message: string;
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

export const validateSavePayload = (payload: unknown): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!isObject(payload)) return [{ path: '', message: 'Payload must be object' }];
  if (typeof payload.version !== 'number') issues.push({ path: 'version', message: 'Required' });
  if (typeof payload.activeSlotId !== 'number') {
    issues.push({ path: 'activeSlotId', message: 'Required' });
  }
  if (!Array.isArray(payload.slots)) issues.push({ path: 'slots', message: 'Must be array' });
  return issues;
};

export const validateSaveEnvelope = (envelope: unknown): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!isObject(envelope)) return [{ path: '', message: 'Envelope must be object' }];

  if (typeof envelope.checksum !== 'string') issues.push({ path: 'checksum', message: 'Required' });
  if (typeof envelope.savedAt !== 'string') issues.push({ path: 'savedAt', message: 'Required' });
  if (typeof envelope.source !== 'string') issues.push({ path: 'source', message: 'Required' });

  issues.push(...validateSavePayload(envelope.payload).map((i) => ({ ...i, path: `payload.${i.path}` })));

  if (issues.length === 0 && typeof envelope.checksum === 'string' && envelope.payload) {
    const canonical = JSON.stringify(envelope.payload);
    if (!verifyChecksum(canonical, envelope.checksum)) {
      issues.push({ path: 'checksum', message: 'Checksum mismatch' });
    }
  }

  const payload = envelope.payload as SavePayload | undefined;
  if (payload && payload.version > SAVE_DATA_VERSION) {
    issues.push({ path: 'payload.version', message: 'Unsupported version' });
  }

  return issues;
};

export const assertValidEnvelope = (envelope: unknown): asserts envelope is SaveEnvelope => {
  const issues = validateSaveEnvelope(envelope);
  if (issues.length > 0) {
    throw new Error(issues.map((i) => i.message).join('; '));
  }
};
