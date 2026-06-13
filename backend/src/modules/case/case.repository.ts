import { prisma } from '../../configuration/prisma';
import { Prisma } from '@prisma/client';

const include = {
  disease: true,
  barangay: true,
  reporter: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
} satisfies Prisma.CaseInclude;

export const caseRepository = {
  findManyPaginated(where: Prisma.CaseWhereInput, skip: number, take: number) {
    return prisma.$transaction([
      prisma.case.findMany({
        where,
        include,
        orderBy: { dateReported: 'desc' },
        skip,
        take,
      }),
      prisma.case.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.case.findUnique({ where: { id }, include });
  },

  findRawById(id: string) {
    return prisma.case.findUnique({ where: { id } });
  },

  findBySourceEncounterId(encounterId: string) {
    return prisma.case.findFirst({ where: { sourceEncounterId: encounterId } });
  },

  create(data: Prisma.CaseCreateInput) {
    return prisma.case.create({ data, include });
  },

  update(id: string, data: Prisma.CaseUpdateInput) {
    return prisma.case.update({ where: { id }, data, include });
  },

  delete(id: string) {
    return prisma.case.delete({ where: { id } });
  },
};
