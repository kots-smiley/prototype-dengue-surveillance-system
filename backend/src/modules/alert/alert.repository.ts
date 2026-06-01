import { prisma } from '../../configuration/prisma';
import { Prisma } from '@prisma/client';

const include = {
  barangay: true,
  disease: true,
  creator: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
} satisfies Prisma.AlertInclude;

export const alertRepository = {
  findManyPaginated(where: Prisma.AlertWhereInput, skip: number, take: number) {
    return prisma.$transaction([
      prisma.alert.findMany({
        where,
        include,
        orderBy: { triggeredAt: 'desc' },
        skip,
        take,
      }),
      prisma.alert.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.alert.findUnique({ where: { id }, include });
  },

  findRawById(id: string) {
    return prisma.alert.findUnique({ where: { id } });
  },

  update(id: string, data: Prisma.AlertUpdateInput) {
    return prisma.alert.update({ where: { id }, data, include });
  },
};
