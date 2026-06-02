/**
 * Minimal structured logger.
 * Replaces stray console.log usage so production output stays consistent.
 */
type LogLevel = 'info' | 'warn' | 'error';

function write(level: LogLevel, message: string, meta?: unknown): void {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  if (level === 'error') {
    meta !== undefined ? console.error(base, meta) : console.error(base);
  } else if (level === 'warn') {
    meta !== undefined ? console.warn(base, meta) : console.warn(base);
  } else {
    meta !== undefined ? console.info(base, meta) : console.info(base);
  }
}

export const logger = {
  info: (message: string, meta?: unknown) => write('info', message, meta),
  warn: (message: string, meta?: unknown) => write('warn', message, meta),
  error: (message: string, meta?: unknown) => write('error', message, meta),
};
