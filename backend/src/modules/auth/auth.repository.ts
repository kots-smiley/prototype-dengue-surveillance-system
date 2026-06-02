import { prisma } from '../../configuration/prisma';
import { Prisma } from '@prisma/client';

/** Data access for users in the context of authentication. */
export const authRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { barangay: true },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        barangayId: true,
        isActive: true,
        createdAt: true,
        barangay: true,
      },
    });
  },

  findRawById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data, include: { barangay: true } });
  },

  updatePassword(id: string, hashedPassword: string) {
    return prisma.user.update({ where: { id }, data: { password: hashedPassword } });
  },
};
