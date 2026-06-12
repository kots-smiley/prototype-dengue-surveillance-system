import { prisma } from '../../configuration/prisma';
import { Prisma } from '@prisma/client';

export const immunizationRepository = {
  findMany(where: Prisma.ImmunizationWhereInput) {
    return prisma.immunization.findMany({ where, orderBy: { dateGiven: 'desc' } });
  },

  findById(id: string) {
    return prisma.immunization.findUnique({ where: { id } });
  },

  create(data: Prisma.ImmunizationCreateInput) {
    return prisma.immunization.create({ data });
  },

  update(id: string, data: Prisma.ImmunizationUpdateInput) {
    return prisma.immunization.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.immunization.delete({ where: { id } });
  },
};
