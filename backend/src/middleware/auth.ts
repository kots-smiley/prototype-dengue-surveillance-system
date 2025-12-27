import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types';
import { createError } from './errorHandler';
import { prisma } from '../utils/prisma';
import { getEnv } from '../utils/env';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        barangayId?: string | null;
    };
    query: any;
    params: any;
    body: any;
    headers: any;
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            throw createError('Authentication required', 401);
        }

        const { JWT_SECRET } = getEnv();
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            email: string;
            role: string;
        };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
                barangayId: true,
                isActive: true
            }
        });

        if (!user || !user.isActive) {
            throw createError('User not found or inactive', 401);
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            barangayId: user.barangayId
        };

        next();
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: 'Invalid or expired token' });
        }
        next(error);
    }
};

export const authorize = (...roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }

        next();
    };
};


