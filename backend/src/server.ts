// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import * as path from 'path';
import { validateEnv } from './utils/env';

// Load .env from the backend root directory
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

// Validate environment variables
try {
  validateEnv();
} catch (error: any) {
  console.error(error.message);
  process.exit(1);
}

import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { auditLogger } from './middleware/auditLogger';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import barangayRoutes from './routes/barangays';
import caseRoutes from './routes/cases';
import reportRoutes from './routes/reports';
import alertRoutes from './routes/alerts';
import dashboardRoutes from './routes/dashboard';
import exportRoutes from './routes/exports';
import publicRoutes from './routes/public';

import { getEnv } from './utils/env';

const app = express();
const { PORT, FRONTEND_URL, FRONTEND_URLS, NODE_ENV } = getEnv();

// Middleware - CORS Configuration
const defaultDevOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

const extraOrigins = (FRONTEND_URLS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([
  ...(FRONTEND_URL ? [FRONTEND_URL] : []),
  ...extraOrigins,
  ...defaultDevOrigins
]));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(auditLogger);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/barangays', barangayRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/public', publicRoutes);

// Backwards-compatible route aliases (in case a client is missing the /api prefix)
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/barangays', barangayRoutes);
app.use('/cases', caseRoutes);
app.use('/reports', reportRoutes);
app.use('/alerts', alertRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/exports', exportRoutes);
app.use('/public', publicRoutes);

// Error handling
app.use(errorHandler);

const serverPort = Number(PORT || process.env.PORT || 5000);
app.listen(serverPort, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${serverPort}`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
});


