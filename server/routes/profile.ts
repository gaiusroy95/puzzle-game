import { Router } from 'express';
import type { ApiSuccess, ProfileResponse } from '../../shared/types/api.js';
import type { PlayerProfile } from '../../shared/types/profile.js';
import { asyncHandler, HttpError } from '../middleware/errorHandler.js';
import type { ProfileRepository } from '../services/ProfileRepository.js';

export const createProfileRouter = (profileRepo: ProfileRepository): Router => {
  const router = Router();

  router.get(
    '/:playerId',
    asyncHandler(async (req, res) => {
      const playerId = req.params.playerId ?? '';
      const profile = await profileRepo.get(playerId);
      const body: ApiSuccess<ProfileResponse> = { ok: true, data: { profile } };
      res.json(body);
    }),
  );

  router.put(
    '/:playerId',
    asyncHandler(async (req, res) => {
      const playerId = req.params.playerId ?? '';
      const patch = req.body as Partial<PlayerProfile>;
      const current = await profileRepo.get(playerId);
      if (patch.displayName && patch.displayName.length > 32) {
        throw new HttpError('Display name too long', 400, 'VALIDATION_ERROR');
      }
      const profile = await profileRepo.put({
        ...current,
        ...patch,
        playerId,
        updatedAt: new Date().toISOString(),
      });
      const body: ApiSuccess<ProfileResponse> = { ok: true, data: { profile } };
      res.json(body);
    }),
  );

  return router;
};
