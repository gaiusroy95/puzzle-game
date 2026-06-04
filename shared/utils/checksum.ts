/**
 * Deterministic checksum for save integrity (not cryptographic — tamper detection only).
 */
export const computeChecksum = (payload: string): string => {
  let hash = 5381;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash * 33) ^ payload.charCodeAt(i);
  }
  return `djb2-${(hash >>> 0).toString(16)}`;
};

export const verifyChecksum = (payload: string, checksum: string): boolean =>
  computeChecksum(payload) === checksum;
