import { Router } from 'express';
import type { ApiSuccess, StatisticsResponse } from '../../shared/types/api.js';
import type { PlayerStatistics } from '../../shared/types/statistics.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import type { StatisticsRepository } from '../services/StatisticsRepository.js';

export const createStatisticsRouter = (statsRepo: StatisticsRepository): Router => {
  const router = Router();

  router.get(
    '/:playerId',
    asyncHandler(async (req, res) => {
      const playerId = req.params.playerId ?? '';
      const statistics = await statsRepo.get(playerId);
      const body: ApiSuccess<StatisticsResponse> = { ok: true, data: { statistics } };
      res.json(body);
    }),
  );

  router.put(
    '/:playerId',
    asyncHandler(async (req, res) => {
      const playerId = req.params.playerId ?? '';
      const partial = req.body as Partial<PlayerStatistics>;
      const statistics = await statsRepo.patch(playerId, partial);
      const body: ApiSuccess<StatisticsResponse> = { ok: true, data: { statistics } };
      res.json(body);
    }),
  );

  return router;
};
