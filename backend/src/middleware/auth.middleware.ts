import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../configuration/prisma';
import { getEnv } from '../configuration/env';
import { UserRole } from '../configuration/constants';
import { AppError } from '../helper/app-error';
import { sendError } from '../helper/api-response';
import { AuthRequest } from '../types';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Verify the bearer token and attach the active user to the request.
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const { JWT_SECRET } = getEnv();
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, barangayId: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      barangayId: user.barangayId,
    };
    next();
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      sendError(res, 'Invalid or expired token', 401);
      return;
    }
    next(error);
  }
}

/**
 * Restrict a route to the given roles. Must run after authenticate.
 */
export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }
    if (!roles.includes(req.user.role as UserRole)) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }
    next();
  };
}
