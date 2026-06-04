import { Router } from 'express';
import type { ApiSuccess, HealthResponse } from '../../shared/types/api.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const body: ApiSuccess<HealthResponse> = {
    ok: true,
    data: { status: 'ok', timestamp: new Date().toISOString() },
  };
  res.json(body);
});
