import type {
  CloudSaveUploadRequest,
  SaveRecordResponse,
  SaveValidateRequest,
  SaveValidateResponse,
} from '@contracts/api';
import type { SaveEnvelope } from '@contracts/save';
import { authApi } from './authApi';
import { apiClient } from './ApiClient';

export const saveApi = {
  validate: (envelope: SaveEnvelope): Promise<SaveValidateResponse> =>
    apiClient.post<SaveValidateResponse>('/saves/validate', { envelope } satisfies SaveValidateRequest),

  getCloudSave: (playerId: string, slotId: number): Promise<SaveRecordResponse> =>
    apiClient.get<SaveRecordResponse>(`/saves/${playerId}/${slotId}`, {
      authToken: authApi.getStoredToken(),
    }),

  uploadCloudSave: (
    request: CloudSaveUploadRequest,
  ): Promise<SaveRecordResponse> =>
    apiClient.put<SaveRecordResponse>(
      `/saves/${request.playerId}/${request.slotId}`,
      { envelope: request.envelope },
      { authToken: authApi.getStoredToken() },
    ),
};
