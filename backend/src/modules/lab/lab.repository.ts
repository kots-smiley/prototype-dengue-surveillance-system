import { prisma } from '../../configuration/prisma';
import { Prisma } from '@prisma/client';

export const labRepository = {
  findMany(where: Prisma.LabResultWhereInput) {
    return prisma.labResult.findMany({ where, orderBy: { resultDate: 'desc' } });
  },

  findById(id: string) {
    return prisma.labResult.findUnique({ where: { id } });
  },

  create(data: Prisma.LabResultCreateInput) {
    return prisma.labResult.create({ data });
  },

  update(id: string, data: Prisma.LabResultUpdateInput) {
    return prisma.labResult.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.labResult.delete({ where: { id } });
  },
};
