import { Router } from 'express';
import crypto from 'node:crypto';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthService } from '../services/AuthService.js';
import type { ApiSuccess, GuestAuthResponse } from '../../shared/types/api.js';

const router = Router();
const authService = new AuthService();

router.post(
  '/guest',
  asyncHandler(async (_req, res) => {
    const playerId = crypto.randomUUID();
    const { token, expiresAt } = authService.createGuestToken(playerId);
    const body: ApiSuccess<GuestAuthResponse> = {
      ok: true,
      data: { token, playerId, expiresAt },
    };
    res.json(body);
  }),
);

export const authRouter = router;
