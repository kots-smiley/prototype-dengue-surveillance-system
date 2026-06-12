import { Prisma } from '@prisma/client';
import { referralRepository } from './referral.repository';
import {
  CreateReferralInput,
  UpdateReferralStatusInput,
  ListReferralQuery,
} from './referral.schema';
import { AppError } from '../../helper/app-error';
import { AuthUser } from '../../types';

export const referralService = {
  async list(query: ListReferralQuery) {
    const where: Prisma.ReferralWhereInput = {};
    if (query.patientId) where.patientId = query.patientId;
    if (query.status) where.status = query.status;
    if (query.facilityId) {
      if (query.direction === 'INCOMING') where.toFacilityId = query.facilityId;
      else if (query.direction === 'OUTGOING') where.fromFacilityId = query.facilityId;
      else where.OR = [{ toFacilityId: query.facilityId }, { fromFacilityId: query.facilityId }];
    }
    const referrals = await referralRepository.findMany(where);
    return { referrals };
  },

  async create(input: CreateReferralInput, user: AuthUser) {
    const fromFacilityId = input.fromFacilityId ?? user.facilityId;
    if (!fromFacilityId) {
      throw new AppError('A referring facility is required (assign the provider to a facility)', 400);
    }
    if (fromFacilityId === input.toFacilityId) {
      throw new AppError('Referring and receiving facilities must differ', 400);
    }

    const data: Prisma.ReferralCreateInput = {
      patient: { connect: { id: input.patientId } },
      fromFacility: { connect: { id: fromFacilityId } },
      toFacility: { connect: { id: input.toFacilityId } },
      reason: input.reason,
      clinicalSummary: input.clinicalSummary,
      priority: input.priority,
      referredById: user.id,
      status: 'REQUESTED',
    };
    if (input.encounterId) data.encounter = { connect: { id: input.encounterId } };

    return referralRepository.create(data);
  },

  async updateStatus(id: string, input: UpdateReferralStatusInput) {
    const existing = await referralRepository.findById(id);
    if (!existing) {
      throw new AppError('Referral not found', 404);
    }
    const resolved = input.status === 'COMPLETED' || input.status === 'REJECTED';
    return referralRepository.update(id, {
      status: input.status,
      resolvedAt: resolved ? new Date() : null,
    });
  },
};
