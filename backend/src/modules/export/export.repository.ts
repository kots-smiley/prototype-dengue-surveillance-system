import { prisma } from '../../configuration/prisma';
import { Prisma } from '@prisma/client';

export const exportRepository = {
  findCases(where: Prisma.CaseWhereInput) {
    return prisma.case.findMany({
      where,
      include: {
        disease: true,
        barangay: true,
        reporter: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { dateReported: 'desc' },
    });
  },

  findReports(where: Prisma.RiskReportWhereInput) {
    return prisma.riskReport.findMany({
      where,
      include: {
        barangay: true,
        reporter: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { dateReported: 'desc' },
    });
  },

  findCasesInRange(where: Prisma.CaseWhereInput) {
    return prisma.case.findMany({ where, include: { disease: true, barangay: true } });
  },

  findReportsInRange(where: Prisma.RiskReportWhereInput) {
    return prisma.riskReport.findMany({ where, include: { barangay: true } });
  },

  findAlertsInRange(where: Prisma.AlertWhereInput) {
    return prisma.alert.findMany({ where, include: { barangay: true, disease: true } });
  },

  listBarangays() {
    return prisma.barangay.findMany({ orderBy: { name: 'asc' } });
  },
};
