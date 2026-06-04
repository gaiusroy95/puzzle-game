import { Router } from 'express';
import type { ApiSuccess, SaveValidateRequest, SaveValidateResponse } from '../../shared/types/api.js';
import type { SaveRecordResponse } from '../../shared/types/api.js';
import { env } from '../config/env.js';
import { asyncHandler, HttpError } from '../middleware/errorHandler.js';
import { optionalAuth, requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { validateSaveEnvelope } from '../validation/saveValidation.js';
import type { SaveRepository } from '../services/SaveRepository.js';

export const createSavesRouter = (saveRepo: SaveRepository): Router => {
  const router = Router();

  router.post(
    '/validate',
    asyncHandler(async (req, res) => {
      const { envelope } = req.body as SaveValidateRequest;
      const issues = validateSaveEnvelope(envelope);
      const body: ApiSuccess<SaveValidateResponse> = {
        ok: true,
        data: { valid: issues.length === 0, issues },
      };
      res.json(body);
    }),
  );

  router.get(
    '/:playerId/:slotId',
    optionalAuth,
    requireAuth,
    asyncHandler(async (req: AuthenticatedRequest, res) => {
      if (!env.enableCloudSaves) {
        throw new HttpError('Cloud saves disabled', 503, 'CLOUD_SAVES_DISABLED');
      }
      const playerId = req.params.playerId ?? '';
      const slotId = Number(req.params.slotId);
      if (req.auth?.playerId !== playerId) {
        throw new HttpError('Forbidden', 403, 'FORBIDDEN');
      }
      const record = await saveRepo.get(playerId, slotId);
      if (!record) throw new HttpError('Save not found', 404, 'SAVE_NOT_FOUND');

      const body: ApiSuccess<SaveRecordResponse> = {
        ok: true,
        data: {
          playerId: record.playerId,
          slotId: record.slotId,
          envelope: record.envelope,
          syncedAt: record.syncedAt,
        },
      };
      res.json(body);
    }),
  );

  router.put(
    '/:playerId/:slotId',
    optionalAuth,
    requireAuth,
    asyncHandler(async (req: AuthenticatedRequest, res) => {
      if (!env.enableCloudSaves) {
        throw new HttpError('Cloud saves disabled', 503, 'CLOUD_SAVES_DISABLED');
      }
      const playerId = req.params.playerId ?? '';
      const slotId = Number(req.params.slotId);
      if (req.auth?.playerId !== playerId) {
        throw new HttpError('Forbidden', 403, 'FORBIDDEN');
      }
      const { envelope } = req.body as { envelope: unknown };
      const issues = validateSaveEnvelope(envelope);
      if (issues.length > 0) {
        throw new HttpError('Invalid save data', 400, 'VALIDATION_ERROR', issues);
      }
      const record = await saveRepo.put(playerId, slotId, envelope as import('../../shared/types/save.js').SaveEnvelope);
      const body: ApiSuccess<SaveRecordResponse> = {
        ok: true,
        data: {
          playerId: record.playerId,
          slotId: record.slotId,
          envelope: record.envelope,
          syncedAt: record.syncedAt,
        },
      };
      res.json(body);
    }),
  );

  return router;
};
