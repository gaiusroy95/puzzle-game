import { Router } from 'express';
import { healthRouter } from './health.js';
import { authRouter } from './auth.js';
import { createSavesRouter } from './saves.js';
import { createProfileRouter } from './profile.js';
import { createStatisticsRouter } from './statistics.js';
import type { SaveRepository } from '../services/SaveRepository.js';
import type { ProfileRepository } from '../services/ProfileRepository.js';
import type { StatisticsRepository } from '../services/StatisticsRepository.js';

export interface ApiDependencies {
  saveRepo: SaveRepository;
  profileRepo: ProfileRepository;
  statsRepo: StatisticsRepository;
}

export const createApiRouter = (deps: ApiDependencies): Router => {
  const router = Router();

  router.use('/health', healthRouter);
  router.use('/auth', authRouter);
  router.use('/saves', createSavesRouter(deps.saveRepo));
  router.use('/profile', createProfileRouter(deps.profileRepo));
  router.use('/statistics', createStatisticsRouter(deps.statsRepo));

  router.get('/', (_req, res) => {
    res.json({
      ok: true,
      data: {
        name: 'puzzle-game-api',
        version: '0.2.0',
        routes: ['/health', '/auth/guest', '/saves', '/profile', '/statistics'],
      },
    });
  });

  return router;
};
