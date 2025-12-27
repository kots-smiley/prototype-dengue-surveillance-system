import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

// Get Barangay case data for analytics
export const getBarangayCaseData = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const barangays = await prisma.barangay.findMany({
      include: {
        _count: {
          select: {
            cases: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const data = barangays.map(b => ({
      id: b.id,
      name: b.name,
      code: b.code,
      municipality: b.municipality,
      province: b.province,
      caseCount: b._count.cases,
      population: b.population || 0
    }));

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// Get time series data for forecasting
export const getTimeSeriesData = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { barangayId, months = '12' } = req.query;
    const monthsCount = parseInt(months as string);
    const now = new Date();

    const where: any = {};
    if (barangayId) {
      where.barangayId = barangayId;
    }

    const timeSeries = [];
    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const cases = await prisma.dengueCase.count({
        where: {
          ...where,
          dateReported: {
            gte: date,
            lt: nextDate
          }
        }
      });

      timeSeries.push({
        date: date.toISOString().split('T')[0],
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        cases
      });
    }

    res.json({
      success: true,
      timeSeries
    });
  } catch (error) {
    next(error);
  }
};
