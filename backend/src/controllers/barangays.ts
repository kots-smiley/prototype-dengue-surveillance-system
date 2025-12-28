import { Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { prisma } from '../utils/prisma';

const createBarangaySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  municipality: z.string().min(1),
  province: z.string().min(1),
  population: z.number().int().positive().optional()
});

const updateBarangaySchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  municipality: z.string().min(1).optional(),
  province: z.string().min(1).optional(),
  population: z.number().int().positive().optional()
});

export const getBarangays = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { municipality, province, search } = req.query;

    const where: any = {};
    if (municipality) where.municipality = municipality;
    if (province) where.province = province;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { code: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const barangays = await prisma.barangay.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      barangays
    });
  } catch (error) {
    next(error);
  }
};

export const getBarangayById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const barangay = await prisma.barangay.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            cases: true,
            reports: true,
            alerts: true
          }
        }
      }
    });

    if (!barangay) {
      throw createError('Barangay not found', 404);
    }

    res.json({
      success: true,
      barangay
    });
  } catch (error) {
    next(error);
  }
};

export const createBarangay = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createBarangaySchema.parse(req.body);

    const existingBarangay = await prisma.barangay.findFirst({
      where: {
        OR: [
          { name: data.name },
          { code: data.code }
        ]
      }
    });

    if (existingBarangay) {
      throw createError('Barangay with this name or code already exists', 400);
    }

    const barangay = await prisma.barangay.create({
      data: data as any
    });

    res.status(201).json({
      success: true,
      barangay
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

export const updateBarangay = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updateBarangaySchema.parse(req.body);

    const barangay = await prisma.barangay.findUnique({
      where: { id }
    });

    if (!barangay) {
      throw createError('Barangay not found', 404);
    }

    if (data.name || data.code) {
      const existingBarangay = await prisma.barangay.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                data.name ? { name: data.name } : {},
                data.code ? { code: data.code } : {}
              ]
            }
          ]
        }
      });

      if (existingBarangay) {
        throw createError('Barangay with this name or code already exists', 400);
      }
    }

    const updatedBarangay = await prisma.barangay.update({
      where: { id },
      data
    });

    res.json({
      success: true,
      barangay: updatedBarangay
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

export const deleteBarangay = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const barangay = await prisma.barangay.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            cases: true,
            reports: true,
            alerts: true
          }
        }
      }
    });

    if (!barangay) {
      throw createError('Barangay not found', 404);
    }

    // Check if barangay has associated data
    const hasData =
      (barangay._count.users || 0) > 0 ||
      (barangay._count.cases || 0) > 0 ||
      (barangay._count.reports || 0) > 0 ||
      (barangay._count.alerts || 0) > 0;

    if (hasData) {
      throw createError(
        'Cannot delete barangay with associated users, cases, reports, or alerts. Please remove or reassign them first.',
        400
      );
    }

    await prisma.barangay.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Barangay deleted successfully'
    });
  } catch (error: any) {
    next(error);
  }
};


