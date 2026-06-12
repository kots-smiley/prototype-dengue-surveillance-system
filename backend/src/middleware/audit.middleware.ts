import { Response, NextFunction } from 'express';
import { prisma } from '../configuration/prisma';
import { logger } from '../helper/logger';
import { AuthRequest } from '../types';

// PII-bearing read endpoints whose access must be audited (ISO 27799).
// The HIE module records its own (consent-aware, break-glass) access events.
const SENSITIVE_READ_PREFIXES = ['/api/patients', '/api/fhir', '/api/portal', '/api/documents'];

function isSensitiveRead(method: string, path: string): boolean {
  return method === 'GET' && SENSITIVE_READ_PREFIXES.some((p) => path.startsWith(p));
}

/**
 * Persist an audit-log entry for every mutating API call, plus access events
 * for reads of patient-identifiable data (ISO 27799 / RA 10173). Logging
 * happens after the response is sent so it never blocks the request.
 */
export function auditLogger(req: AuthRequest, res: Response, next: NextFunction): void {
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const sensitiveRead = isSensitiveRead(req.method, req.path);

  if ((!isMutation && !sensitiveRead) || !req.path.startsWith('/api/') || req.path === '/api/health') {
    return next();
  }

  const start = Date.now();

  res.on('finish', () => {
    const userId = req.user?.id;
    const resource = req.path.split('/')[2]?.toUpperCase();
    const resourceId = req.params?.id;
    const purposeOfUse = isMutation ? 'ADMINISTRATIVE' : 'TREATMENT';

    void prisma.auditLog
      .create({
        data: {
          userId: userId || undefined,
          action: `${req.method} ${req.path}`,
          resource,
          resourceId: resourceId || undefined,
          purposeOfUse,
          facilityId: req.user?.facilityId || undefined,
          details: JSON.stringify({
            statusCode: res.statusCode,
            duration: `${Date.now() - start}ms`,
            access: sensitiveRead ? 'PII_READ' : 'MUTATION',
          }),
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.get('user-agent'),
        },
      })
      .catch((error) => logger.error('Audit log write failed', error));
  });

  next();
}
