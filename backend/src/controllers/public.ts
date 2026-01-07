import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

function startOfWeekMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun,1=Mon
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, days: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + days);
  return date;
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function linearRegressionPredict(values: number[], horizon: number): number[] {
  // Simple linear regression y = a*x + b on x = 0..n-1
  const n = values.length;
  if (n === 0) return Array.from({ length: horizon }, () => 0);
  if (n === 1) return Array.from({ length: horizon }, () => values[0]);

  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

  const denom = n * sumXX - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  return Array.from({ length: horizon }, (_, i) => {
    const futureX = n + i;
    const predicted = slope * futureX + intercept;
    return Math.max(0, Math.round(predicted));
  });
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export const getPublicDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalCases,
      currentMonthCases,
      previousMonthCases,
      totalBarangays,
      activeAlerts,
      totalReports
    ] = await Promise.all([
      prisma.dengueCase.count({}),
      prisma.dengueCase.count({
        where: {
          dateReported: { gte: currentMonthStart }
        }
      }),
      prisma.dengueCase.count({
        where: {
          dateReported: {
            gte: previousMonthStart,
            lte: previousMonthEnd
          }
        }
      }),
      prisma.barangay.count(),
      prisma.alert.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      prisma.environmentalReport.count({
        where: {
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

export const getPublicBarangayCaseData = async (_req: Request, res: Response, next: NextFunction) => {
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

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getPublicTimeSeriesData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { barangayId, months = '12' } = req.query as any;
    const monthsCount = parseInt(months, 10);
    const now = new Date();

    const where: any = {};
    if (barangayId) where.barangayId = barangayId;

    const timeSeries: Array<{ date: string; month: number; year: number; cases: number }> = [];
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

    res.json({ success: true, timeSeries });
  } catch (error) {
    next(error);
  }
};

export const getPublicAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status = 'ACTIVE', riskLevel, limit = '5' } = req.query as any;
    const take = Math.min(50, Math.max(1, parseInt(limit, 10) || 5));

    const where: any = {};
    if (status) where.status = status;
    if (riskLevel) where.riskLevel = riskLevel;

    const alerts = await prisma.alert.findMany({
      where,
      include: { barangay: true },
      orderBy: { triggeredAt: 'desc' },
      take
    });

    res.json({ success: true, alerts });
  } catch (error) {
    next(error);
  }
};

export const getPublicForecastSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { weeks = '12' } = req.query as any;
    const weeksCount = Math.min(52, Math.max(4, parseInt(weeks, 10) || 12));

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Weekly buckets (historical)
    const thisWeekStart = startOfWeekMonday(now);
    const buckets = Array.from({ length: weeksCount }, (_, idx) => {
      const start = addDays(thisWeekStart, -(weeksCount - 1 - idx) * 7);
      const end = addDays(start, 7);
      const label = `${formatShortDate(start)}–${formatShortDate(addDays(end, -1))}`;
      return { start, end, label };
    });

    const weeklyCases: number[] = [];
    for (const b of buckets) {
      const count = await prisma.dengueCase.count({
        where: {
          dateReported: {
            gte: b.start,
            lt: b.end
          }
        }
      });
      weeklyCases.push(count);
    }

    // Forecast next 4 weeks (+ bounds)
    const next4 = linearRegressionPredict(weeklyCases, 4);
    // Residual stddev (simple, conservative proxy)
    const residualStd = stdDev(weeklyCases);
    const z = 1.0; // keep bounds conservative to avoid extreme ranges

    const forecastStart = addDays(thisWeekStart, 7);
    const forecast = next4.map((cases, i) => {
      const start = addDays(forecastStart, i * 7);
      const end = addDays(start, 7);
      const lower = Math.max(0, Math.round(cases - z * residualStd));
      const upper = Math.max(lower, Math.round(cases + z * residualStd));
      return {
        week: `${formatShortDate(start)}–${formatShortDate(addDays(end, -1))}`,
        cases,
        lower,
        upper
      };
    });

    // Stats cards
    const [activeCases, totalCasesThisMonth] = await Promise.all([
      prisma.dengueCase.count({ where: { dateReported: { gte: sevenDaysAgo } } }),
      prisma.dengueCase.count({ where: { dateReported: { gte: monthStart } } })
    ]);
    const forecastNextWeek = forecast[0]?.cases ?? 0;

    // Alerts (top 5)
    const alerts = await prisma.alert.findMany({
      where: { status: 'ACTIVE' },
      include: { barangay: true },
      orderBy: { triggeredAt: 'desc' },
      take: 5
    });

    // Risk assessment (top 6 barangays, last 30 days scoring)
    const riskWindowStart = new Date(now);
    riskWindowStart.setDate(now.getDate() - 30);

    const barangays = await prisma.barangay.findMany({
      include: {
        _count: {
          select: {
            cases: {
              where: {
                dateReported: { gte: riskWindowStart }
              }
            },
            reports: {
              where: {
                dateReported: { gte: riskWindowStart },
                OR: [
                  { stagnantWater: true },
                  { poorWasteDisposal: true },
                  { cloggedDrainage: true },
                  { housingCongestion: true }
                ]
              }
            },
            alerts: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        },
        alerts: {
          where: { status: 'ACTIVE' },
          orderBy: { triggeredAt: 'desc' },
          take: 1
        }
      }
    });

    const weekStart = thisWeekStart;
    const prevWeekStart = addDays(weekStart, -7);
    const prevWeekEnd = weekStart;
    const thisWeekEnd = addDays(weekStart, 7);

    const riskRanked = [];
    for (const b of barangays) {
      const cases30 = (b as any)._count?.cases ?? 0;
      const reports30 = (b as any)._count?.reports ?? 0;
      const activeAlertCount = (b as any)._count?.alerts ?? 0;
      const riskScore = cases30 * 2 + reports30 + activeAlertCount * 5;

      // Trend (this week vs previous week)
      const [thisWeekCases, prevWeekCases] = await Promise.all([
        prisma.dengueCase.count({ where: { barangayId: b.id, dateReported: { gte: weekStart, lt: thisWeekEnd } } }),
        prisma.dengueCase.count({ where: { barangayId: b.id, dateReported: { gte: prevWeekStart, lt: prevWeekEnd } } })
      ]);
      const delta = thisWeekCases - prevWeekCases;
      const trend = delta > 0 ? 'increasing' : delta < 0 ? 'decreasing' : 'stable';

      const topAlert = (b as any).alerts?.[0];
      const hasHighAlert = topAlert?.riskLevel === 'HIGH';

      let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
      if (activeAlertCount > 0 && hasHighAlert) riskLevel = 'CRITICAL';
      else if (activeAlertCount > 0 || riskScore >= 40) riskLevel = 'HIGH';
      else if (riskScore >= 15) riskLevel = 'MODERATE';

      riskRanked.push({
        id: b.id,
        name: b.name,
        municipality: b.municipality,
        province: b.province,
        casesReported: cases30,
        riskScore,
        riskLevel,
        trend
      });
    }

    riskRanked.sort((a, b) => b.riskScore - a.riskScore);
    const regionalRisk = riskRanked.slice(0, 6);

    const criticalRegions = riskRanked.filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH').length;

    // Last updated (max of latest activity)
    const [latestCase, latestReport, latestAlert] = await Promise.all([
      prisma.dengueCase.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
      prisma.environmentalReport.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
      prisma.alert.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } })
    ]);
    const maxTs = Math.max(
      latestCase?.updatedAt?.getTime() ?? 0,
      latestReport?.updatedAt?.getTime() ?? 0,
      latestAlert?.updatedAt?.getTime() ?? 0
    );
    const lastUpdated = new Date(maxTs || now.getTime()).toISOString();

    res.json({
      success: true,
      meta: {
        lastUpdated,
        systemActive: true
      },
      stats: {
        activeCases,
        totalCasesThisMonth,
        forecastNextWeek,
        criticalRegions
      },
      weeklyTrends: buckets.map((b, idx) => ({
        week: b.label,
        cases: weeklyCases[idx]
      })),
      forecastNext4Weeks: forecast,
      regionalRiskAssessment: regionalRisk,
      activeAlerts: alerts.map(a => ({
        id: a.id,
        title: a.title,
        message: a.message,
        riskLevel: a.riskLevel,
        status: a.status,
        triggeredAt: a.triggeredAt,
        barangay: a.barangay ? {
          id: a.barangay.id,
          name: a.barangay.name,
          municipality: a.barangay.municipality,
          province: a.barangay.province
        } : null
      }))
    });
  } catch (error) {
    next(error);
  }
};


