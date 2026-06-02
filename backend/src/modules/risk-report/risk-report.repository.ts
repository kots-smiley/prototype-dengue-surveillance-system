import { prisma } from '../../configuration/prisma';
import { Prisma } from '@prisma/client';

const include = {
  barangay: true,
  reporter: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
} satisfies Prisma.RiskReportInclude;

export const riskReportRepository = {
  findManyPaginated(where: Prisma.RiskReportWhereInput, skip: number, take: number) {
    return prisma.$transaction([
      prisma.riskReport.findMany({
        where,
        include,
        orderBy: { dateReported: 'desc' },
        skip,
        take,
      }),
      prisma.riskReport.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.riskReport.findUnique({ where: { id }, include });
  },

  findRawById(id: string) {
    return prisma.riskReport.findUnique({ where: { id } });
  },

  create(data: Prisma.RiskReportCreateInput) {
    return prisma.riskReport.create({ data, include });
  },

  update(id: string, data: Prisma.RiskReportUpdateInput) {
    return prisma.riskReport.update({ where: { id }, data, include });
  },

  delete(id: string) {
    return prisma.riskReport.delete({ where: { id } });
  },
};
