import { z } from 'zod';

/**
 * Environment variable schema and loader.
 * Validated once at startup; consumers read typed values via getEnv().
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Server
  PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // CORS — primary frontend plus optional comma-separated extra origins
  FRONTEND_URL: z.string().url().optional(),
  FRONTEND_URLS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env | undefined;

export function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.errors
      .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Environment variable validation failed:\n${issues}`);
  }

  env = parsed.data;
  return env;
}

export function getEnv(): Env {
  if (!env) {
    env = validateEnv();
  }
  return env;
}
