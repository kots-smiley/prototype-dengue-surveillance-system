import { Prisma } from '@prisma/client';
import { immunizationRepository } from './immunization.repository';
import {
  CreateImmunizationInput,
  UpdateImmunizationInput,
  ListImmunizationQuery,
} from './immunization.schema';
import { AppError } from '../../helper/app-error';

export const immunizationService = {
  async list(query: ListImmunizationQuery) {
    const where: Prisma.ImmunizationWhereInput = {};
    if (query.patientId) where.patientId = query.patientId;
    return immunizationRepository.findMany(where);
  },

  async create(input: CreateImmunizationInput) {
    const { patientId, ...rest } = input;
    return immunizationRepository.create({
      ...rest,
      patient: { connect: { id: patientId } },
    });
  },

  async update(id: string, input: UpdateImmunizationInput) {
    const existing = await immunizationRepository.findById(id);
    if (!existing) {
      throw new AppError('Immunization record not found', 404);
    }
    return immunizationRepository.update(id, input);
  },

  async remove(id: string) {
    const existing = await immunizationRepository.findById(id);
    if (!existing) {
      throw new AppError('Immunization record not found', 404);
    }
    await immunizationRepository.delete(id);
  },
};
