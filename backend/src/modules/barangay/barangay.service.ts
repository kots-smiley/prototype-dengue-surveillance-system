import { Prisma } from '@prisma/client';
import { barangayRepository } from './barangay.repository';
import { CreateBarangayInput, UpdateBarangayInput, ListBarangayQuery } from './barangay.schema';
import { AppError } from '../../helper/app-error';
import { buildContainsOr } from '../../helper/text-search';

export const barangayService = {
  list(query: ListBarangayQuery) {
    const where: Prisma.BarangayWhereInput = {};
    if (query.municipality) where.municipality = query.municipality;
    if (query.province) where.province = query.province;
    if (query.search) {
      where.OR = buildContainsOr(['name', 'code'], query.search.trim());
    }
    return barangayRepository.findMany(where);
  },

  async getById(id: string) {
    const barangay = await barangayRepository.findByIdWithCounts(id);
    if (!barangay) {
      throw new AppError('Barangay not found', 404);
    }
    return barangay;
  },

  async create(input: CreateBarangayInput) {
    const existing = await barangayRepository.findByNameOrCode(input.name, input.code);
    if (existing) {
      throw new AppError('Barangay with this name or code already exists', 400);
    }
    return barangayRepository.create(input);
  },

  async update(id: string, input: UpdateBarangayInput) {
    const barangay = await barangayRepository.findById(id);
    if (!barangay) {
      throw new AppError('Barangay not found', 404);
    }
    if (input.name || input.code) {
      const clash = await barangayRepository.findByNameOrCode(input.name, input.code, id);
      if (clash) {
        throw new AppError('Barangay with this name or code already exists', 400);
      }
    }
    return barangayRepository.update(id, input);
  },

  async remove(id: string) {
    const barangay = await barangayRepository.findByIdWithCounts(id);
    if (!barangay) {
      throw new AppError('Barangay not found', 404);
    }

    const { users, cases, reports, alerts } = barangay._count;
    if (users + cases + reports + alerts > 0) {
      throw new AppError(
        'Cannot delete a barangay with linked users, cases, reports, or alerts. Reassign or remove them first.',
        400
      );
    }
    await barangayRepository.delete(id);
  },
};
