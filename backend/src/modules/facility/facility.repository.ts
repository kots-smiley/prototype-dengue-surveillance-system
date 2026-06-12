import { prisma } from '../../configuration/prisma';
import { Prisma } from '@prisma/client';

const include = {
  barangay: true,
  _count: { select: { users: true, encounters: true, patients: true } },
} satisfies Prisma.FacilityInclude;

export const facilityRepository = {
  findMany(where: Prisma.FacilityWhereInput) {
    return prisma.facility.findMany({ where, include, orderBy: { name: 'asc' } });
  },

  findById(id: string) {
    return prisma.facility.findUnique({ where: { id }, include });
  },

  findByCode(code: string, excludeId?: string) {
    return prisma.facility.findFirst({
      where: { code, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
  },

  create(data: Prisma.FacilityCreateInput) {
    return prisma.facility.create({ data, include });
  },

  update(id: string, data: Prisma.FacilityUpdateInput) {
    return prisma.facility.update({ where: { id }, data, include });
  },

  delete(id: string) {
    return prisma.facility.delete({ where: { id } });
  },
};
