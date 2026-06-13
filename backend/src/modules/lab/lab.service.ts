import { Prisma } from '@prisma/client';
import { labRepository } from './lab.repository';
import { CreateLabInput, UpdateLabInput, ListLabQuery } from './lab.schema';
import { AppError } from '../../helper/app-error';
import { AuthUser } from '../../types';

export const labService = {
  async list(query: ListLabQuery) {
    const where: Prisma.LabResultWhereInput = {};
    if (query.patientId) where.patientId = query.patientId;
    if (query.encounterId) where.encounterId = query.encounterId;
    if (query.status) where.status = query.status;
    return labRepository.findMany(where);
  },

  async create(input: CreateLabInput, user?: AuthUser) {
    const { patientId, encounterId, status, ...rest } = input;
    const data: Prisma.LabResultCreateInput = {
      ...rest,
      status: status ?? 'ORDERED',
      patient: { connect: { id: patientId } },
      orderedById: user?.id,
    };
    if (encounterId) data.encounter = { connect: { id: encounterId } };
    if (status === 'RESULTED' || (!status && rest.value)) {
      data.status = 'RESULTED';
      data.resultDate = rest.resultDate ?? new Date();
    }
    return labRepository.create(data);
  },

  async update(id: string, input: UpdateLabInput) {
    const existing = await labRepository.findById(id);
    if (!existing) {
      throw new AppError('Lab result not found', 404);
    }
    const { encounterId, status, ...rest } = input;
    const data: Prisma.LabResultUpdateInput = { ...rest };
    if (status) data.status = status;
    if (status === 'RESULTED' && !rest.resultDate) {
      data.resultDate = new Date();
    }
    if (encounterId !== undefined) {
      data.encounter = encounterId ? { connect: { id: encounterId } } : { disconnect: true };
    }
    return labRepository.update(id, data);
  },

  async cancel(id: string) {
    const existing = await labRepository.findById(id);
    if (!existing) {
      throw new AppError('Lab order not found', 404);
    }
    if (existing.status === 'RESULTED') {
      throw new AppError('Cannot cancel a resulted lab test', 400);
    }
    return labRepository.update(id, { status: 'CANCELLED' });
  },

  async remove(id: string) {
    const existing = await labRepository.findById(id);
    if (!existing) {
      throw new AppError('Lab result not found', 404);
    }
    await labRepository.delete(id);
  },
};
