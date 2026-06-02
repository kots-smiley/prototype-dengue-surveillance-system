import { Prisma } from '@prisma/client';
import { publicRepository } from './public.repository';
import { ForecastQuery, TimeSeriesQuery } from './public.schema';

// --- date helpers ---------------------------------------------------------
function startOfWeekMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun
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

// --- simple statistics (rule-based, NOT ML) -------------------------------
function linearRegressionPredict(values: number[], horizon: number): number[] {
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
    const predicted = slope * (n + i) + intercept;
    return Math.max(0, Math.round(predicted));
  });
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export const publicService = {
  listDiseases() {
    return publicRepository.listActiveDiseases();
  },

  async getStats(diseaseId?: string) {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const base: Prisma.CaseWhereInput = diseaseId ? { diseaseId } : {};

    const [totalCases, currentMonthCases, previousMonthCases, totalBarangays, activeAlerts, totalReports] =
      await Promise.all([
        publicRepository.countCases(base),
        publicRepository.countCases({ ...base, dateReported: { gte: currentMonthStart } }),
        publicRepository.countCases({
          ...base,
          dateReported: { gte: previousMonthStart, lte: previousMonthEnd },
        }),
        publicRepository.countBarangays(),
        publicRepository.countActiveAlerts(),
        publicRepository.countReports({ dateReported: { gte: currentMonthStart } }),
      ]);

    const caseIncrease =
      previousMonthCases > 0
        ? ((currentMonthCases - previousMonthCases) / previousMonthCases) * 100
        : currentMonthCases > 0
          ? 100
          : 0;

    return {
      totalCases,
      currentMonthCases,
      previousMonthCases,
      caseIncrease: parseFloat(caseIncrease.toFixed(2)),
      totalBarangays,
      activeAlerts,
      totalReports,
    };
  },

  async getTimeSeries(query: TimeSeriesQuery) {
    const monthsCount = parseInt(query.months ?? '12', 10) || 12;
    const now = new Date();

    const where: Prisma.CaseWhereInput = {};
    if (query.barangayId) where.barangayId = query.barangayId;
    if (query.diseaseId) where.diseaseId = query.diseaseId;

    const timeSeries = [];
    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const cases = await publicRepository.countCases({
        ...where,
        dateReported: { gte: date, lt: nextDate },
      });
      timeSeries.push({
        date: date.toISOString().split('T')[0],
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        cases,
      });
    }
    return timeSeries;
  },

  async getForecastSummary(query: ForecastQuery) {
    const weeksCount = Math.min(52, Math.max(4, parseInt(query.weeks ?? '12', 10) || 12));
    const diseaseFilter: Prisma.CaseWhereInput = query.diseaseId
      ? { diseaseId: query.diseaseId }
      : {};

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = addDays(now, -7);
    const thisWeekStart = startOfWeekMonday(now);

    // Historical weekly buckets
    const buckets = Array.from({ length: weeksCount }, (_, idx) => {
      const start = addDays(thisWeekStart, -(weeksCount - 1 - idx) * 7);
      const end = addDays(start, 7);
      return {
        start,
        end,
        label: `${formatShortDate(start)}-${formatShortDate(addDays(end, -1))}`,
      };
    });

    const weeklyCases: number[] = [];
    for (const b of buckets) {
      weeklyCases.push(
        await publicRepository.countCases({
          ...diseaseFilter,
          dateReported: { gte: b.start, lt: b.end },
        })
      );
    }

    // Forecast next 4 weeks with conservative bounds
    const next4 = linearRegressionPredict(weeklyCases, 4);
    const residualStd = stdDev(weeklyCases);
    const z = 1.0;
    const forecastStart = addDays(thisWeekStart, 7);
    const forecast = next4.map((cases, i) => {
      const start = addDays(forecastStart, i * 7);
      const end = addDays(start, 7);
      const lower = Math.max(0, Math.round(cases - z * residualStd));
      const upper = Math.max(lower, Math.round(cases + z * residualStd));
      return {
        week: `${formatShortDate(start)}-${formatShortDate(addDays(end, -1))}`,
        cases,
        lower,
        upper,
      };
    });

    const [activeCases, totalCasesThisMonth] = await Promise.all([
      publicRepository.countCases({ ...diseaseFilter, dateReported: { gte: sevenDaysAgo } }),
      publicRepository.countCases({ ...diseaseFilter, dateReported: { gte: monthStart } }),
    ]);

    // Regional risk assessment (last 30 days)
    const riskWindowStart = addDays(now, -30);
    const prevWeekStart = addDays(thisWeekStart, -7);
    const thisWeekEnd = addDays(thisWeekStart, 7);

    const barangays = await publicRepository.listBarangays();
    const riskRanked = [];
    for (const b of barangays) {
      const caseWhere: Prisma.CaseWhereInput = {
        ...diseaseFilter,
        barangayId: b.id,
        dateReported: { gte: riskWindowStart },
      };
      const [cases30, reports30, activeAlertCount, thisWeekCases, prevWeekCases] = await Promise.all([
        publicRepository.countCases(caseWhere),
        publicRepository.countReports({ barangayId: b.id, dateReported: { gte: riskWindowStart } }),
        publicRepository.countActiveAlertsForBarangay(b.id, query.diseaseId),
        publicRepository.countCases({
          ...diseaseFilter,
          barangayId: b.id,
          dateReported: { gte: thisWeekStart, lt: thisWeekEnd },
        }),
        publicRepository.countCases({
          ...diseaseFilter,
          barangayId: b.id,
          dateReported: { gte: prevWeekStart, lt: thisWeekStart },
        }),
      ]);

      const riskScore = cases30 * 2 + reports30 + activeAlertCount * 5;
      const delta = thisWeekCases - prevWeekCases;
      const trend = delta > 0 ? 'increasing' : delta < 0 ? 'decreasing' : 'stable';

      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      if (activeAlertCount > 0 || riskScore >= 40) riskLevel = 'HIGH';
      else if (riskScore >= 15) riskLevel = 'MEDIUM';

      riskRanked.push({
        id: b.id,
        name: b.name,
        municipality: b.municipality,
        province: b.province,
        casesReported: cases30,
        riskScore,
        riskLevel,
        trend,
      });
    }

    riskRanked.sort((a, b) => b.riskScore - a.riskScore);
    const regionalRisk = riskRanked.slice(0, 6);
    const criticalRegions = riskRanked.filter((r) => r.riskLevel === 'HIGH').length;

    const alerts = await publicRepository.recentActiveAlerts(5);
    const [latestCase, latestReport, latestAlert] = await publicRepository.latestUpdatedAt();
    const maxTs = Math.max(
      latestCase?.updatedAt?.getTime() ?? 0,
      latestReport?.updatedAt?.getTime() ?? 0,
      latestAlert?.updatedAt?.getTime() ?? 0
    );

    return {
      meta: {
        lastUpdated: new Date(maxTs || now.getTime()).toISOString(),
        systemActive: true,
      },
      stats: {
        activeCases,
        totalCasesThisMonth,
        forecastNextWeek: forecast[0]?.cases ?? 0,
        criticalRegions,
      },
      weeklyTrends: buckets.map((b, idx) => ({ week: b.label, cases: weeklyCases[idx] })),
      forecastNext4Weeks: forecast,
      regionalRiskAssessment: regionalRisk,
      activeAlerts: alerts.map((a) => ({
        id: a.id,
        title: a.title,
        message: a.message,
        riskLevel: a.riskLevel,
        status: a.status,
        triggeredAt: a.triggeredAt,
        disease: a.disease
          ? { id: a.disease.id, name: a.disease.name, code: a.disease.code }
          : null,
        barangay: a.barangay
          ? {
              id: a.barangay.id,
              name: a.barangay.name,
              municipality: a.barangay.municipality,
              province: a.barangay.province,
            }
          : null,
      })),
    };
  },
};
