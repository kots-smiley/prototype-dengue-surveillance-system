import { prisma } from '../../configuration/prisma';
import { Prisma } from '@prisma/client';

const safeSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  barangayId: true,
  facilityId: true,
  licenseNo: true,
  providerType: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  barangay: true,
  facility: true,
} satisfies Prisma.UserSelect;

export const userRepository = {
  findMany(where: Prisma.UserWhereInput) {
    return prisma.user.findMany({
      where,
      select: safeSelect,
      orderBy: { createdAt: 'desc' },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: safeSelect });
  },

  findRawById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data, select: safeSelect });
  },

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data, select: safeSelect });
  },
};
