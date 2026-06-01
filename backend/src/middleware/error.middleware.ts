import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../helper/app-error';
import { logger } from '../helper/logger';
import { sendError } from '../helper/api-response';

/**
 * Global error handler. Converts thrown errors into the standard
 * { success, message, data } envelope.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): Response {
  // Zod validation errors -> 400 with field details
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation error', 400, details);
  }

  // Known operational errors
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  // Prisma "record not found" style errors
  const anyErr = err as { code?: string; message?: string };
  if (anyErr?.code === 'P2025') {
    return sendError(res, 'Resource not found', 404);
  }

  // Unknown errors -> 500
  const message = anyErr?.message || 'Internal Server Error';
  logger.error(`Unhandled error on ${req.method} ${req.path}`, message);
  return sendError(res, 'Internal Server Error', 500);
}

/** 404 handler for unmatched routes. */
export function notFoundHandler(req: Request, res: Response): Response {
  return sendError(res, `Route not found: ${req.method} ${req.path}`, 404);
}
