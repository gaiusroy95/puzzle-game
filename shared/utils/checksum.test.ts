import { describe, expect, it } from 'vitest';
import { computeChecksum, verifyChecksum } from './checksum.js';

describe('checksum', () => {
  it('produces stable hash for same payload', () => {
    const payload = '{"version":3,"activeSlotId":0}';
    expect(computeChecksum(payload)).toBe(computeChecksum(payload));
  });

  it('detects tampering', () => {
    const payload = '{"a":1}';
    const checksum = computeChecksum(payload);
    expect(verifyChecksum(payload, checksum)).toBe(true);
    expect(verifyChecksum('{"a":2}', checksum)).toBe(false);
  });
});
