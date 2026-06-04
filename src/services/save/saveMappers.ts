import type { SavePayload, SaveSlotData } from '@contracts/save';
import { SAVE_DATA_VERSION } from '@contracts/save';
import type { SaveState, SaveSlot } from '@shared/state';

export const saveStateToPayload = (state: SaveState): SavePayload => ({
  version: SAVE_DATA_VERSION,
  activeSlotId: state.activeSlotId,
  slots: state.slots.map(slotToData),
});

export const payloadToSaveState = (payload: SavePayload): SaveState => ({
  version: payload.version,
  activeSlotId: payload.activeSlotId,
  slots: payload.slots.map(dataToSlot),
});

const slotToData = (slot: SaveSlot): SaveSlotData => ({
  slotId: slot.slotId,
  label: slot.label,
  updatedAt: slot.updatedAt,
  progress: { ...slot.progress },
});

const dataToSlot = (data: SaveSlotData): SaveSlot => ({
  slotId: data.slotId,
  label: data.label,
  updatedAt: data.updatedAt,
  progress: { ...data.progress },
});
