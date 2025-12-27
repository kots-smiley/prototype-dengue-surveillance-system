import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export const auditLogger = async (req: Request, res: Response, next: NextFunction) => {
  // Skip logging for health checks and non-API routes
  if (req.path === '/api/health' || !req.path.startsWith('/api/')) {
    return next();
  }

  const originalSend = res.send;
  const startTime = Date.now();

  res.send = function (body: any) {
    const duration = Date.now() - startTime;
    const userId = (req as any).user?.id;

    // Log asynchronously without blocking the response
    setImmediate(async () => {
      try {
        const action = `${req.method} ${req.path}`;
        const resource = req.path.split('/')[2]?.toUpperCase(); // Extract resource from path
        const resourceId = (req as any).params?.id;

        await prisma.auditLog.create({
          data: {
            userId: userId || undefined,
            action,
            resource,
            resourceId: resourceId || undefined,
            details: JSON.stringify({
              method: req.method,
              path: req.path,
              statusCode: res.statusCode,
              duration: `${duration}ms`
            }),
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.get('user-agent')
          }
        });
      } catch (error) {
        console.error('Audit log error:', error);
      }
    });

    return originalSend.call(this, body);
  };

  next();
};


