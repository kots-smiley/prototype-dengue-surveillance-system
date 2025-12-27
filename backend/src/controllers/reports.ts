import { Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { triggerEarlyWarningCheck } from '../services/earlyWarning';
import { prisma } from '../utils/prisma';

const createReportSchema = z.object({
  barangayId: z.string(),
  dateReported: z.string().transform((str) => new Date(str)).optional(),
  stagnantWater: z.boolean().default(false),
  poorWasteDisposal: z.boolean().default(false),
  cloggedDrainage: z.boolean().default(false),
  housingCongestion: z.boolean().default(false),
  photoUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional()
});

const updateReportSchema = z.object({
  barangayId: z.string().optional(),
  dateReported: z.string().transform((str) => new Date(str)).optional(),
  stagnantWater: z.boolean().optional(),
  poorWasteDisposal: z.boolean().optional(),
  cloggedDrainage: z.boolean().optional(),
  housingCongestion: z.boolean().optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional()
});

export const getReports = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      barangayId,
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

    if (startDate || endDate) {
      where.dateReported = {};
      if (startDate) where.dateReported.gte = new Date(startDate as string);
      if (endDate) where.dateReported.lte = new Date(endDate as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [reports, total] = await Promise.all([
      prisma.environmentalReport.findMany({
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
      prisma.environmentalReport.count({ where })
    ]);

    res.json({
      success: true,
      reports,
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

export const getReportById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const report = await prisma.environmentalReport.findUnique({
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

    if (!report) {
      throw createError('Report not found', 404);
    }

    // Role-based access
    if (req.user!.role === 'BHW' && report.barangayId !== req.user!.barangayId) {
      throw createError('Access denied', 403);
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
};

export const createReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createReportSchema.parse(req.body);

    // Verify barangay exists
    const barangay = await prisma.barangay.findUnique({
      where: { id: data.barangayId }
    });

    if (!barangay) {
      throw createError('Barangay not found', 404);
    }

    // Role-based restrictions
    if (req.user!.role === 'BHW' && data.barangayId !== req.user!.barangayId) {
      throw createError('BHW can only create reports for their assigned barangay', 403);
    }

    const report = await prisma.environmentalReport.create({
      data: {
        ...data,
        reportedBy: req.user!.id,
        dateReported: data.dateReported || new Date(),
        photoUrl: data.photoUrl || undefined
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
      report
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

export const updateReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updateReportSchema.parse(req.body);

    const report = await prisma.environmentalReport.findUnique({
      where: { id }
    });

    if (!report) {
      throw createError('Report not found', 404);
    }

    // Role-based restrictions
    if (req.user!.role === 'BHW') {
      if (report.barangayId !== req.user!.barangayId) {
        throw createError('Access denied', 403);
      }
      if (data.barangayId && data.barangayId !== req.user!.barangayId) {
        throw createError('BHW can only update reports for their assigned barangay', 403);
      }
    }

    const updatedReport = await prisma.environmentalReport.update({
      where: { id },
      data: {
        ...data,
        barangayId: data.barangayId || undefined,
        photoUrl: data.photoUrl || undefined
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
      report: updatedReport
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

export const deleteReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const report = await prisma.environmentalReport.findUnique({
      where: { id }
    });

    if (!report) {
      throw createError('Report not found', 404);
    }

    await prisma.environmentalReport.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};


