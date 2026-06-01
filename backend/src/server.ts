import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { getEnv } from './configuration/env';
import routes from './routes';
import { requestLogger } from './middleware/logging.middleware';
import { auditLogger } from './middleware/audit.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

/**
 * Build and configure the Express application (without starting it).
 * Keeping this separate from index.ts makes the app testable.
 */
export function createServer(): Application {
  const app = express();
  const { FRONTEND_URL, FRONTEND_URLS, NODE_ENV } = getEnv();

  // --- CORS -----------------------------------------------------------------
  const defaultDevOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];
  const extraOrigins = (FRONTEND_URLS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const allowedOrigins = Array.from(
    new Set([...(FRONTEND_URL ? [FRONTEND_URL] : []), ...extraOrigins, ...defaultDevOrigins])
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || NODE_ENV === 'development') {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // --- Security & parsing ---------------------------------------------------
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  app.use(auditLogger);

  // --- Routes ---------------------------------------------------------------
  app.use('/api', routes);

  // --- Error handling -------------------------------------------------------
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
