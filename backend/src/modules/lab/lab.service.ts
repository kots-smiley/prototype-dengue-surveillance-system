import { Prisma } from '@prisma/client';
import { labRepository } from './lab.repository';
import { CreateLabInput, UpdateLabInput, ListLabQuery } from './lab.schema';
import { AppError } from '../../helper/app-error';

export const labService = {
  async list(query: ListLabQuery) {
    const where: Prisma.LabResultWhereInput = {};
    if (query.patientId) where.patientId = query.patientId;
    if (query.encounterId) where.encounterId = query.encounterId;
    return labRepository.findMany(where);
  },

  async create(input: CreateLabInput) {
    const { patientId, encounterId, ...rest } = input;
    const data: Prisma.LabResultCreateInput = {
      ...rest,
      patient: { connect: { id: patientId } },
    };
    if (encounterId) data.encounter = { connect: { id: encounterId } };
    return labRepository.create(data);
  },

  async update(id: string, input: UpdateLabInput) {
    const existing = await labRepository.findById(id);
    if (!existing) {
      throw new AppError('Lab result not found', 404);
    }
    const { encounterId, ...rest } = input;
    const data: Prisma.LabResultUpdateInput = { ...rest };
    if (encounterId !== undefined) {
      data.encounter = encounterId ? { connect: { id: encounterId } } : { disconnect: true };
    }
    return labRepository.update(id, data);
  },

  async remove(id: string) {
    const existing = await labRepository.findById(id);
    if (!existing) {
      throw new AppError('Lab result not found', 404);
    }
    await labRepository.delete(id);
  },
};
