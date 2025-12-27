import { Response, NextFunction } from 'express';
import { CaseStatus, CaseSource } from '../types';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { triggerEarlyWarningCheck } from '../services/earlyWarning';
import { prisma } from '../utils/prisma';

const createCaseSchema = z.object({
  barangayId: z.string(),
  dateReported: z.string().transform((str) => new Date(str)),
  age: z.number().int().min(0).max(120).optional().default(0),
  ageGroup: z.string().optional().default('N/A'),
  status: z.enum(['SUSPECTED', 'CONFIRMED']),
  source: z.enum(['PUBLIC_HOSPITAL', 'PRIVATE_HOSPITAL', 'RHU', 'BHW']),
  notes: z.string().optional()
});

const updateCaseSchema = z.object({
  barangayId: z.string().optional(),
  dateReported: z.string().transform((str) => new Date(str)).optional(),
  age: z.number().int().min(0).max(120).optional(),
  ageGroup: z.string().optional(),
  status: z.enum(['SUSPECTED', 'CONFIRMED']).optional(),
  source: z.enum(['PUBLIC_HOSPITAL', 'PRIVATE_HOSPITAL', 'RHU', 'BHW']).optional(),
  notes: z.string().optional()
});

export const getCases = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      barangayId,
      status,
      source,
      startDate,
      endDate,
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
    if (source) where.source = source;

    if (startDate || endDate) {
      where.dateReported = {};
      if (startDate) where.dateReported.gte = new Date(startDate as string);
      if (endDate) where.dateReported.lte = new Date(endDate as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [cases, total] = await Promise.all([
      prisma.dengueCase.findMany({
        where,
        include: {
          barangay: true,
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { dateReported: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.dengueCase.count({ where })
    ]);

    res.json({
      success: true,
      cases,
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

export const getCaseById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const caseRecord = await prisma.dengueCase.findUnique({
      where: { id },
      include: {
        barangay: true,
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!caseRecord) {
      throw createError('Case not found', 404);
    }

    // Role-based access
    if (req.user!.role === 'BHW' && caseRecord.barangayId !== req.user!.barangayId) {
      throw createError('Access denied', 403);
    }

    res.json({
      success: true,
      case: caseRecord
    });
  } catch (error) {
    next(error);
  }
};

export const createCase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createCaseSchema.parse(req.body);

    // Verify barangay exists
    const barangay = await prisma.barangay.findUnique({
      where: { id: data.barangayId }
    });

    if (!barangay) {
      throw createError('Barangay not found', 404);
    }

    // Role-based restrictions
    if (req.user!.role === 'BHW' && data.barangayId !== req.user!.barangayId) {
      throw createError('BHW can only create cases for their assigned barangay', 403);
    }

    const caseRecord = await prisma.dengueCase.create({
      data: {
        ...data,
        age: data.age ?? 0,
        ageGroup: data.ageGroup ?? 'N/A',
        reportedBy: req.user!.id
      },
      include: {
        barangay: true,
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Trigger early warning check asynchronously
    setImmediate(() => {
      triggerEarlyWarningCheck(data.barangayId).catch(console.error);
    });

    res.status(201).json({
      success: true,
      case: caseRecord
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

export const updateCase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updateCaseSchema.parse(req.body);

    const caseRecord = await prisma.dengueCase.findUnique({
      where: { id }
    });

    if (!caseRecord) {
      throw createError('Case not found', 404);
    }

    // Role-based restrictions
    if (req.user!.role === 'BHW') {
      if (caseRecord.barangayId !== req.user!.barangayId) {
        throw createError('Access denied', 403);
      }
      if (data.barangayId && data.barangayId !== req.user!.barangayId) {
        throw createError('BHW can only update cases for their assigned barangay', 403);
      }
    }

    const updatedCase = await prisma.dengueCase.update({
      where: { id },
      data: {
        ...data,
        barangayId: data.barangayId || undefined
      },
      include: {
        barangay: true,
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Trigger early warning check if barangay changed
    if (data.barangayId) {
      setImmediate(() => {
        triggerEarlyWarningCheck(data.barangayId!).catch(console.error);
      });
    }

    res.json({
      success: true,
      case: updatedCase
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

export const deleteCase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const caseRecord = await prisma.dengueCase.findUnique({
      where: { id }
    });

    if (!caseRecord) {
      throw createError('Case not found', 404);
    }

    await prisma.dengueCase.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Case deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};


