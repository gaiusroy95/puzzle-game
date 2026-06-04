import { describe, expect, it } from 'vitest';
import { saveValidator } from './SaveValidator';
import { SAVE_DATA_VERSION } from '@contracts/save';

const validPayload = {
  version: SAVE_DATA_VERSION,
  activeSlotId: 0,
  slots: [
    {
      slotId: 0,
      label: 'Slot 1',
      updatedAt: new Date().toISOString(),
      progress: {
        currentLevelId: null,
        completedLevelIds: [],
        unlockedLevelIds: ['level-01'],
        levelProgress: {},
        totalStars: 0,
        bestScores: {},
        lastPlayedAt: null,
      },
    },
  ],
};

describe('SaveValidator', () => {
  it('accepts valid payload', () => {
    const result = saveValidator.validatePayload(validPayload);
    expect(result.valid).toBe(true);
  });

  it('rejects missing slots', () => {
    const result = saveValidator.validatePayload({ version: 3, activeSlotId: 0 });
    expect(result.valid).toBe(false);
  });
});
