import 'dotenv/config';
import { env } from './config/env.js';
import { createApp } from './app.js';

const PORT = env.port;

const app = await createApp();

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
  console.log(`[server] data directory: ${env.dataDir}`);
});
