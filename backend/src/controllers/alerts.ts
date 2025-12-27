import { Response, NextFunction } from 'express';
import { AlertStatus } from '../types';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { prisma } from '../utils/prisma';

const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'RESOLVED', 'DISMISSED'])
});

export const getAlerts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      barangayId,
      status,
      riskLevel,
      page = '1',
      limit = '50'
    } = req.query;

    const where: any = {};

    // Role-based filtering
    if (req.user!.role === 'BHW' && req.user!.barangayId) {
      where.barangayId = req.user!.barangayId;
    } else if (barangayId) {
      where.barangayId = barangayId;
    }

    if (status) where.status = status;
    if (riskLevel) where.riskLevel = riskLevel;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        include: {
          barangay: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { triggeredAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.alert.count({ where })
    ]);

    res.json({
      success: true,
      alerts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAlertById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        barangay: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!alert) {
      throw createError('Alert not found', 404);
    }

    // Role-based access
    if (req.user!.role === 'BHW' && alert.barangayId !== req.user!.barangayId) {
      throw createError('Access denied', 403);
    }

    res.json({
      success: true,
      alert
    });
  } catch (error) {
    next(error);
  }
};

export const updateAlertStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);

    const alert = await prisma.alert.findUnique({
      where: { id }
    });

    if (!alert) {
      throw createError('Alert not found', 404);
    }

    const updateData: any = { status };
    if (status === AlertStatus.RESOLVED && !alert.resolvedAt) {
      updateData.resolvedAt = new Date();
    }

    const updatedAlert = await prisma.alert.update({
      where: { id },
      data: updateData,
      include: {
        barangay: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      alert: updatedAlert
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    next(error);
  }
};

export const resolveAlert = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.findUnique({
      where: { id }
    });

    if (!alert) {
      throw createError('Alert not found', 404);
    }

    const updatedAlert = await prisma.alert.update({
      where: { id },
      data: {
        status: AlertStatus.RESOLVED,
        resolvedAt: new Date()
      },
      include: {
        barangay: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      alert: updatedAlert
    });
  } catch (error) {
    next(error);
  }
};


