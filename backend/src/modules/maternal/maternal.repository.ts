import { prisma } from '../../configuration/prisma';
import { Prisma } from '@prisma/client';

export const maternalRepository = {
  findMany(where: Prisma.MaternalRecordWhereInput) {
    return prisma.maternalRecord.findMany({ where, orderBy: { visitDate: 'desc' } });
  },

  findById(id: string) {
    return prisma.maternalRecord.findUnique({ where: { id } });
  },

  create(data: Prisma.MaternalRecordCreateInput) {
    return prisma.maternalRecord.create({ data });
  },

  update(id: string, data: Prisma.MaternalRecordUpdateInput) {
    return prisma.maternalRecord.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.maternalRecord.delete({ where: { id } });
  },
};
