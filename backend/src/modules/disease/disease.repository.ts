import { prisma } from '../../configuration/prisma';
import { Prisma } from '@prisma/client';

export const diseaseRepository = {
  findMany(where: Prisma.DiseaseWhereInput) {
    return prisma.disease.findMany({ where, orderBy: { name: 'asc' } });
  },

  findById(id: string) {
    return prisma.disease.findUnique({
      where: { id },
      include: { _count: { select: { cases: true, alerts: true } } },
    });
  },

  findByNameOrCode(name?: string, code?: string, excludeId?: string) {
    const or: Prisma.DiseaseWhereInput[] = [];
    if (name) or.push({ name });
    if (code) or.push({ code });
    if (or.length === 0) return null;

    return prisma.disease.findFirst({
      where: {
        AND: [excludeId ? { id: { not: excludeId } } : {}, { OR: or }],
      },
    });
  },

  create(data: Prisma.DiseaseCreateInput) {
    return prisma.disease.create({ data });
  },

  update(id: string, data: Prisma.DiseaseUpdateInput) {
    return prisma.disease.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.disease.delete({ where: { id } });
  },

  countCases(diseaseId: string) {
    return prisma.case.count({ where: { diseaseId } });
  },
};
