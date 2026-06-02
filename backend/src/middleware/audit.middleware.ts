import { Response, NextFunction } from 'express';
import { prisma } from '../configuration/prisma';
import { logger } from '../helper/logger';
import { AuthRequest } from '../types';

/**
 * Persist an audit-log entry for every mutating API call.
 * Logging happens after the response is sent so it never blocks the request.
 */
export function auditLogger(req: AuthRequest, res: Response, next: NextFunction): void {
  // Only audit state-changing requests under /api.
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  if (!isMutation || !req.path.startsWith('/api/') || req.path === '/api/health') {
    return next();
  }

  const start = Date.now();

  res.on('finish', () => {
    const userId = req.user?.id;
    const resource = req.path.split('/')[2]?.toUpperCase();
    const resourceId = req.params?.id;

    void prisma.auditLog
      .create({
        data: {
          userId: userId || undefined,
          action: `${req.method} ${req.path}`,
          resource,
          resourceId: resourceId || undefined,
          details: JSON.stringify({
            statusCode: res.statusCode,
            duration: `${Date.now() - start}ms`,
          }),
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.get('user-agent'),
        },
      })
      .catch((error) => logger.error('Audit log write failed', error));
  });

  next();
}
