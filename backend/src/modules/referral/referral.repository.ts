import { prisma } from '../../configuration/prisma';
import { Prisma } from '@prisma/client';

const include = {
  patient: { select: { id: true, patientCode: true, firstName: true, lastName: true } },
  fromFacility: true,
  toFacility: true,
} satisfies Prisma.ReferralInclude;

export const referralRepository = {
  findMany(where: Prisma.ReferralWhereInput) {
    return prisma.referral.findMany({ where, include, orderBy: { createdAt: 'desc' } });
  },

  findById(id: string) {
    return prisma.referral.findUnique({ where: { id }, include });
  },

  create(data: Prisma.ReferralCreateInput) {
    return prisma.referral.create({ data, include });
  },

  update(id: string, data: Prisma.ReferralUpdateInput) {
    return prisma.referral.update({ where: { id }, data, include });
  },
};
