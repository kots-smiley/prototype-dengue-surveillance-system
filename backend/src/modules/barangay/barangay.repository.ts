import { prisma } from '../../configuration/prisma';
import { Prisma } from '@prisma/client';

export const barangayRepository = {
  findMany(where: Prisma.BarangayWhereInput) {
    return prisma.barangay.findMany({ where, orderBy: { name: 'asc' } });
  },

  findById(id: string) {
    return prisma.barangay.findUnique({ where: { id } });
  },

  findByIdWithCounts(id: string) {
    return prisma.barangay.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true, cases: true, reports: true, alerts: true } },
      },
    });
  },

  findByNameOrCode(name?: string, code?: string, excludeId?: string) {
    const or: Prisma.BarangayWhereInput[] = [];
    if (name) or.push({ name });
    if (code) or.push({ code });
    if (or.length === 0) return null;

    return prisma.barangay.findFirst({
      where: { AND: [excludeId ? { id: { not: excludeId } } : {}, { OR: or }] },
    });
  },

  create(data: Prisma.BarangayCreateInput) {
    return prisma.barangay.create({ data });
  },

  update(id: string, data: Prisma.BarangayUpdateInput) {
    return prisma.barangay.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.barangay.delete({ where: { id } });
  },
};
