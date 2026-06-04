export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT) || 3001,
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  dataDir: process.env.DATA_DIR ?? './data',
  authSecret: process.env.AUTH_SECRET ?? 'dev-secret-change-in-production',
  enableCloudSaves: process.env.ENABLE_CLOUD_SAVES !== 'false',
};
