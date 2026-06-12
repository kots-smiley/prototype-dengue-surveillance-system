import { Prisma } from '@prisma/client';
import { maternalRepository } from './maternal.repository';
import { CreateMaternalInput, UpdateMaternalInput, ListMaternalQuery } from './maternal.schema';
import { AppError } from '../../helper/app-error';

export const maternalService = {
  async list(query: ListMaternalQuery) {
    const where: Prisma.MaternalRecordWhereInput = {};
    if (query.patientId) where.patientId = query.patientId;
    return maternalRepository.findMany(where);
  },

  async create(input: CreateMaternalInput) {
    const { patientId, ...rest } = input;
    return maternalRepository.create({
      ...rest,
      patient: { connect: { id: patientId } },
    });
  },

  async update(id: string, input: UpdateMaternalInput) {
    const existing = await maternalRepository.findById(id);
    if (!existing) {
      throw new AppError('Maternal record not found', 404);
    }
    return maternalRepository.update(id, input);
  },

  async remove(id: string) {
    const existing = await maternalRepository.findById(id);
    if (!existing) {
      throw new AppError('Maternal record not found', 404);
    }
    await maternalRepository.delete(id);
  },
};
