import { Prisma } from '@prisma/client';
import { diseaseRepository } from './disease.repository';
import { CreateDiseaseInput, UpdateDiseaseInput, ListDiseaseQuery } from './disease.schema';
import { AppError } from '../../helper/app-error';

export const diseaseService = {
  list(query: ListDiseaseQuery) {
    const where: Prisma.DiseaseWhereInput = {};
    if (query.category) where.category = query.category;
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    return diseaseRepository.findMany(where);
  },

  async getById(id: string) {
    const disease = await diseaseRepository.findById(id);
    if (!disease) {
      throw new AppError('Disease not found', 404);
    }
    return disease;
  },

  async create(input: CreateDiseaseInput) {
    const existing = await diseaseRepository.findByNameOrCode(input.name, input.code);
    if (existing) {
      throw new AppError('A disease with this name or code already exists', 400);
    }
    return diseaseRepository.create(input);
  },

  async update(id: string, input: UpdateDiseaseInput) {
    const disease = await diseaseRepository.findById(id);
    if (!disease) {
      throw new AppError('Disease not found', 404);
    }
    if (input.name || input.code) {
      const clash = await diseaseRepository.findByNameOrCode(input.name, input.code, id);
      if (clash) {
        throw new AppError('A disease with this name or code already exists', 400);
      }
    }
    return diseaseRepository.update(id, input);
  },

  async remove(id: string) {
    const disease = await diseaseRepository.findById(id);
    if (!disease) {
      throw new AppError('Disease not found', 404);
    }

    const caseCount = await diseaseRepository.countCases(id);
    if (caseCount > 0) {
      // Preserve history: deactivate instead of hard delete.
      return diseaseRepository.update(id, { isActive: false });
    }
    await diseaseRepository.delete(id);
    return null;
  },
};
