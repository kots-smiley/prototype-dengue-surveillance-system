// Load environment variables FIRST, before any module that reads them.
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

import { validateEnv, getEnv } from './configuration/env';
import { logger } from './helper/logger';

// Fail fast on invalid configuration.
try {
  validateEnv();
} catch (error) {
  logger.error((error as Error).message);
  process.exit(1);
}

// Import after env validation so modules see a valid config.
import { createServer } from './server';

const { PORT, NODE_ENV } = getEnv();
const serverPort = Number(PORT || process.env.PORT || 5000);

const app = createServer();

app.listen(serverPort, '0.0.0.0', () => {
  logger.info(`HealthWatch API running on port ${serverPort} (${NODE_ENV})`);
});
