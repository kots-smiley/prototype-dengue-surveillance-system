import { prisma } from '../../configuration/prisma';
import { RISK_FACTORS_BY_CATEGORY } from '../../configuration/constants';

function monthRange(year: number, month: number) {
  return {
    gte: new Date(year, month - 1, 1),
    lte: new Date(year, month, 0, 23, 59, 59),
  };
}

export const earlyWarningRepository = {
  caseCountForMonth(diseaseId: string, barangayId: string, year: number, month: number) {
    return prisma.case.count({
      where: { diseaseId, barangayId, dateReported: monthRange(year, month) },
    });
  },

  /**
   * Count risk reports in a month for a barangay whose flagged factors match
   * the given transmission category.
   */
  riskReportCountForMonth(
    category: string,
    barangayId: string,
    year: number,
    month: number
  ) {
    const factors = RISK_FACTORS_BY_CATEGORY[category] || [];
    const orConditions =
      factors.length > 0
        ? factors.map((f) => ({ [f]: true }))
        : [{ stagnantWater: true }];

    return prisma.riskReport.count({
      where: {
        barangayId,
        dateReported: monthRange(year, month),
        OR: orConditions,
      },
    });
  },

  findActiveAlert(diseaseId: string, barangayId: string, riskLevel: string) {
    return prisma.alert.findFirst({
      where: { diseaseId, barangayId, status: 'ACTIVE', riskLevel },
      orderBy: { triggeredAt: 'desc' },
    });
  },

  findActiveAlertsForDisease(diseaseId: string, barangayId: string) {
    return prisma.alert.findMany({
      where: {
        diseaseId,
        barangayId,
        status: 'ACTIVE',
        riskLevel: { in: ['HIGH', 'MEDIUM'] },
      },
    });
  },

  createAlert(data: {
    barangayId: string;
    diseaseId: string;
    title: string;
    message: string;
    riskLevel: string;
    metadata: string;
  }) {
    return prisma.alert.create({ data: { ...data, status: 'ACTIVE' } });
  },

  updateAlert(id: string, data: { message: string; riskLevel: string; metadata: string }) {
    return prisma.alert.update({ where: { id }, data });
  },

  resolveAlert(id: string) {
    return prisma.alert.update({
      where: { id },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    });
  },

  getBarangay(barangayId: string) {
    return prisma.barangay.findUnique({ where: { id: barangayId } });
  },
};
