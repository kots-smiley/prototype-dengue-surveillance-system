import { prisma } from '../../configuration/prisma';
import { Prisma } from '@prisma/client';

export const publicRepository = {
  countCases(where: Prisma.CaseWhereInput) {
    return prisma.case.count({ where });
  },

  countBarangays() {
    return prisma.barangay.count();
  },

  countActiveAlerts() {
    return prisma.alert.count({ where: { status: 'ACTIVE' } });
  },

  countActiveAlertsForBarangay(barangayId: string, diseaseId?: string) {
    return prisma.alert.count({
      where: { barangayId, status: 'ACTIVE', ...(diseaseId ? { diseaseId } : {}) },
    });
  },

  countReports(where: Prisma.RiskReportWhereInput) {
    return prisma.riskReport.count({ where });
  },

  listActiveDiseases() {
    return prisma.disease.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true, category: true, color: true },
      orderBy: { name: 'asc' },
    });
  },

  recentActiveAlerts(take: number) {
    return prisma.alert.findMany({
      where: { status: 'ACTIVE' },
      include: { barangay: true, disease: true },
      orderBy: { triggeredAt: 'desc' },
      take,
    });
  },

  listBarangays() {
    return prisma.barangay.findMany({ orderBy: { name: 'asc' } });
  },

  latestUpdatedAt() {
    return Promise.all([
      prisma.case.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
      prisma.riskReport.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
      prisma.alert.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
    ]);
  },
};
