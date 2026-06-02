import { Prisma } from '@prisma/client';
import { dashboardRepository } from './dashboard.repository';
import { StatsQuery, TrendsQuery, RankingsQuery } from './dashboard.schema';
import { AuthUser } from '../../types';

function scopeByRole(user: AuthUser, barangayId?: string): string | undefined {
  if (user.role === 'BHW' && user.barangayId) return user.barangayId;
  return barangayId;
}

export const dashboardService = {
  async getStats(query: StatsQuery, user: AuthUser) {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const scopedBarangay = scopeByRole(user, query.barangayId);
    const baseCaseWhere: Prisma.CaseWhereInput = {};
    if (scopedBarangay) baseCaseWhere.barangayId = scopedBarangay;
    if (query.diseaseId) baseCaseWhere.diseaseId = query.diseaseId;

    const alertWhere: Prisma.AlertWhereInput = { status: 'ACTIVE' };
    if (scopedBarangay) alertWhere.barangayId = scopedBarangay;
    if (query.diseaseId) alertWhere.diseaseId = query.diseaseId;

    const reportWhere: Prisma.RiskReportWhereInput = {
      dateReported: { gte: currentMonthStart },
    };
    if (scopedBarangay) reportWhere.barangayId = scopedBarangay;

    const [
      totalCases,
      currentMonthCases,
      previousMonthCases,
      totalBarangays,
      totalDiseases,
      activeAlerts,
      totalReports,
    ] = await Promise.all([
      dashboardRepository.countCases(baseCaseWhere),
      dashboardRepository.countCases({
        ...baseCaseWhere,
        dateReported: { gte: currentMonthStart },
      }),
      dashboardRepository.countCases({
        ...baseCaseWhere,
        dateReported: { gte: previousMonthStart, lte: previousMonthEnd },
      }),
      dashboardRepository.countBarangays(),
      dashboardRepository.countDiseases({ isActive: true }),
      dashboardRepository.countAlerts(alertWhere),
      dashboardRepository.countReports(reportWhere),
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
      totalDiseases,
      activeAlerts,
      totalReports,
    };
  },

  async getCaseTrends(query: TrendsQuery, user: AuthUser) {
    const monthsCount = parseInt(query.months ?? '12', 10) || 12;
    const now = new Date();

    const where: Prisma.CaseWhereInput = {};
    const scopedBarangay = scopeByRole(user, query.barangayId);
    if (scopedBarangay) where.barangayId = scopedBarangay;
    if (query.diseaseId) where.diseaseId = query.diseaseId;

    const trends = [];
    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const cases = await dashboardRepository.countCases({
        ...where,
        dateReported: { gte: date, lt: nextDate },
      });
      trends.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        year: date.getFullYear(),
        monthNumber: date.getMonth() + 1,
        cases,
      });
    }
    return trends;
  },

  async getBarangayRankings(query: RankingsQuery) {
    const yearNum = query.year ? parseInt(query.year, 10) : new Date().getFullYear();
    const limitNum = parseInt(query.limit ?? '10', 10) || 10;
    const startDate = new Date(yearNum, 0, 1);
    const endDate = new Date(yearNum, 11, 31, 23, 59, 59);

    const barangays = await dashboardRepository.listBarangays();

    const rankings = await Promise.all(
      barangays.map(async (b) => {
        const caseWhere: Prisma.CaseWhereInput = {
          barangayId: b.id,
          dateReported: { gte: startDate, lte: endDate },
        };
        if (query.diseaseId) caseWhere.diseaseId = query.diseaseId;

        const [caseCount, reportCount, activeAlerts] = await Promise.all([
          dashboardRepository.countCases(caseWhere),
          dashboardRepository.countReports({
            barangayId: b.id,
            dateReported: { gte: startDate, lte: endDate },
          }),
          dashboardRepository.countAlerts({ barangayId: b.id, status: 'ACTIVE' }),
        ]);

        return {
          id: b.id,
          name: b.name,
          code: b.code,
          municipality: b.municipality,
          province: b.province,
          caseCount,
          reportCount,
          activeAlerts,
          riskScore: caseCount * 2 + reportCount + activeAlerts * 5,
        };
      })
    );

    return rankings.sort((a, b) => b.riskScore - a.riskScore).slice(0, limitNum);
  },

  async getDiseaseBreakdown(query: StatsQuery, user: AuthUser) {
    const where: Prisma.CaseWhereInput = {};
    const scopedBarangay = scopeByRole(user, query.barangayId);
    if (scopedBarangay) where.barangayId = scopedBarangay;

    const [grouped, diseases] = await Promise.all([
      dashboardRepository.groupCasesByDisease(where),
      dashboardRepository.listDiseases(),
    ]);

    const diseaseMap = new Map(diseases.map((d) => [d.id, d]));
    return grouped
      .map((g) => {
        const disease = diseaseMap.get(g.diseaseId);
        return {
          diseaseId: g.diseaseId,
          name: disease?.name ?? 'Unknown',
          code: disease?.code ?? '',
          color: disease?.color ?? null,
          caseCount: g._count._all,
        };
      })
      .sort((a, b) => b.caseCount - a.caseCount);
  },

  async getBarangayCaseData(query: StatsQuery) {
    const barangays = await dashboardRepository.listBarangays();
    return Promise.all(
      barangays.map(async (b) => {
        const where: Prisma.CaseWhereInput = { barangayId: b.id };
        if (query.diseaseId) where.diseaseId = query.diseaseId;
        const caseCount = await dashboardRepository.countCases(where);
        return {
          id: b.id,
          name: b.name,
          code: b.code,
          municipality: b.municipality,
          province: b.province,
          caseCount,
          population: b.population || 0,
        };
      })
    );
  },
};
