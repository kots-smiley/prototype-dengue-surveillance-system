import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const where: any = {};
    if (req.user!.role === 'BHW' && req.user!.barangayId) {
      where.barangayId = req.user!.barangayId;
    }

    const [
      totalCases,
      currentMonthCases,
      previousMonthCases,
      totalBarangays,
      activeAlerts,
      totalReports
    ] = await Promise.all([
      prisma.dengueCase.count({ where }),
      prisma.dengueCase.count({
        where: {
          ...where,
          dateReported: { gte: currentMonthStart }
        }
      }),
      prisma.dengueCase.count({
        where: {
          ...where,
          dateReported: {
            gte: previousMonthStart,
            lte: previousMonthEnd
          }
        }
      }),
      prisma.barangay.count(),
      prisma.alert.count({
        where: {
          ...where,
          status: 'ACTIVE'
        }
      }),
      prisma.environmentalReport.count({
        where: {
          ...where,
          dateReported: { gte: currentMonthStart }
        }
      })
    ]);

    const caseIncrease = previousMonthCases > 0
      ? ((currentMonthCases - previousMonthCases) / previousMonthCases) * 100
      : currentMonthCases > 0 ? 100 : 0;

    res.json({
      success: true,
      stats: {
        totalCases,
        currentMonthCases,
        previousMonthCases,
        caseIncrease: parseFloat(caseIncrease.toFixed(2)),
        totalBarangays,
        activeAlerts,
        totalReports
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCaseTrends = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { months = '12', barangayId } = req.query;
    const monthsCount = parseInt(months as string);
    const now = new Date();

    const where: any = {};
    if (req.user!.role === 'BHW' && req.user!.barangayId) {
      where.barangayId = req.user!.barangayId;
    } else if (barangayId) {
      where.barangayId = barangayId;
    }

    const trends = [];
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

      trends.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        year: date.getFullYear(),
        monthNumber: date.getMonth() + 1,
        cases
      });
    }

    res.json({
      success: true,
      trends
    });
  } catch (error) {
    next(error);
  }
};

export const getBarangayRankings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { year, limit = '10' } = req.query;
    const yearNum = year ? parseInt(year as string) : new Date().getFullYear();
    const limitNum = parseInt(limit as string);

    const startDate = new Date(yearNum, 0, 1);
    const endDate = new Date(yearNum, 11, 31, 23, 59, 59);

    const barangays = await prisma.barangay.findMany({
      include: {
        _count: {
          select: {
            cases: {
              where: {
                dateReported: {
                  gte: startDate,
                  lte: endDate
                }
              }
            },
            reports: {
              where: {
                dateReported: {
                  gte: startDate,
                  lte: endDate
                }
              }
            },
            alerts: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      }
    });

    const rankings = barangays
      .map(b => ({
        id: b.id,
        name: b.name,
        code: b.code,
        municipality: b.municipality,
        province: b.province,
        caseCount: b._count.cases,
        reportCount: b._count.reports,
        activeAlerts: b._count.alerts,
        riskScore: b._count.cases * 2 + b._count.reports + b._count.alerts * 5
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, limitNum);

    res.json({
      success: true,
      rankings
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyComparison = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();
    const previousYear = currentYear - 1;

    const where: any = {};
    if (req.user!.role === 'BHW' && req.user!.barangayId) {
      where.barangayId = req.user!.barangayId;
    }

    const currentYearData = [];
    const previousYearData = [];

    for (let month = 1; month <= 12; month++) {
      const currentStart = new Date(currentYear, month - 1, 1);
      const currentEnd = new Date(currentYear, month, 0, 23, 59, 59);
      const previousStart = new Date(previousYear, month - 1, 1);
      const previousEnd = new Date(previousYear, month, 0, 23, 59, 59);

      const [currentCases, previousCases] = await Promise.all([
        prisma.dengueCase.count({
          where: {
            ...where,
            dateReported: {
              gte: currentStart,
              lte: currentEnd
            }
          }
        }),
        prisma.dengueCase.count({
          where: {
            ...where,
            dateReported: {
              gte: previousStart,
              lte: previousEnd
            }
          }
        })
      ]);

      currentYearData.push({
        month,
        monthName: new Date(currentYear, month - 1, 1).toLocaleString('default', { month: 'short' }),
        cases: currentCases
      });

      previousYearData.push({
        month,
        monthName: new Date(previousYear, month - 1, 1).toLocaleString('default', { month: 'short' }),
        cases: previousCases
      });
    }

    res.json({
      success: true,
      comparison: {
        currentYear: currentYearData,
        previousYear: previousYearData,
        years: { current: currentYear, previous: previousYear }
      }
    });
  } catch (error) {
    next(error);
  }
};


