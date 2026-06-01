import { prisma } from '../../configuration/prisma';
import { Prisma } from '@prisma/client';

export const dashboardRepository = {
  countCases(where: Prisma.CaseWhereInput) {
    return prisma.case.count({ where });
  },

  countBarangays() {
    return prisma.barangay.count();
  },

  countDiseases(where: Prisma.DiseaseWhereInput) {
    return prisma.disease.count({ where });
  },

  countAlerts(where: Prisma.AlertWhereInput) {
    return prisma.alert.count({ where });
  },

  countReports(where: Prisma.RiskReportWhereInput) {
    return prisma.riskReport.count({ where });
  },

  groupCasesByDisease(where: Prisma.CaseWhereInput) {
    return prisma.case.groupBy({
      by: ['diseaseId'],
      where,
      _count: { _all: true },
    });
  },

  listDiseases() {
    return prisma.disease.findMany({ select: { id: true, name: true, code: true, color: true } });
  },

  listBarangays() {
    return prisma.barangay.findMany({ orderBy: { name: 'asc' } });
  },
};
