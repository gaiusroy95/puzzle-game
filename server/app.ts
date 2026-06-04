import cors from 'cors';
import express, { type Express } from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createApiRouter } from './routes/index.js';
import { FileStorage } from './storage/FileStorage.js';
import { SaveRepository } from './services/SaveRepository.js';
import { ProfileRepository } from './services/ProfileRepository.js';
import { StatisticsRepository } from './services/StatisticsRepository.js';

export async function createApp(): Promise<Express> {
  const app = express();

  const storage = new FileStorage(env.dataDir);
  await storage.ensureDir();

  const deps = {
    saveRepo: new SaveRepository(storage),
    profileRepo: new ProfileRepository(storage),
    statsRepo: new StatisticsRepository(storage),
  };

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '512kb' }));

  app.use('/api', createApiRouter(deps));

  app.use(errorHandler);

  return app;
}
