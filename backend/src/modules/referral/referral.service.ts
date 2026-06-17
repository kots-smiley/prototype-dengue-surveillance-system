import { Prisma } from '@prisma/client';
import { prisma } from '../../configuration/prisma';
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
    const patient = await prisma.patient.findUnique({
      where: { id: input.patientId },
      select: { homeFacilityId: true },
    });
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    const fromFacilityId =
      input.fromFacilityId ?? user.facilityId ?? patient.homeFacilityId ?? undefined;
    if (!fromFacilityId) {
      throw new AppError(
        'Select a referring facility (or assign the provider / patient to a facility)',
        400
      );
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
