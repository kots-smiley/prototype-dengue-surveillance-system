import { Prisma } from '@prisma/client';
import { facilityRepository } from './facility.repository';
import { CreateFacilityInput, UpdateFacilityInput, ListFacilityQuery } from './facility.schema';
import { AppError } from '../../helper/app-error';
import { buildContainsOr } from '../../helper/text-search';

export const facilityService = {
  async list(query: ListFacilityQuery) {
    const where: Prisma.FacilityWhereInput = {};
    if (query.type) where.type = query.type;
    if (query.barangayId) where.barangayId = query.barangayId;
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';
    if (query.search) {
      where.OR = buildContainsOr(['name', 'code'], query.search.trim());
    }
    const facilities = await facilityRepository.findMany(where);
    return { facilities };
  },

  async getById(id: string) {
    const facility = await facilityRepository.findById(id);
    if (!facility) {
      throw new AppError('Facility not found', 404);
    }
    return facility;
  },

  async create(input: CreateFacilityInput) {
    const existing = await facilityRepository.findByCode(input.code);
    if (existing) {
      throw new AppError('A facility with this code already exists', 409);
    }
    const { barangayId, ...rest } = input;
    const data: Prisma.FacilityCreateInput = { ...rest };
    if (barangayId) data.barangay = { connect: { id: barangayId } };
    return facilityRepository.create(data);
  },

  async update(id: string, input: UpdateFacilityInput) {
    const existing = await facilityRepository.findById(id);
    if (!existing) {
      throw new AppError('Facility not found', 404);
    }
    if (input.code) {
      const dup = await facilityRepository.findByCode(input.code, id);
      if (dup) throw new AppError('A facility with this code already exists', 409);
    }
    const { barangayId, ...rest } = input;
    const data: Prisma.FacilityUpdateInput = { ...rest };
    if (barangayId !== undefined) {
      data.barangay = barangayId ? { connect: { id: barangayId } } : { disconnect: true };
    }
    return facilityRepository.update(id, data);
  },

  async remove(id: string) {
    const existing = await facilityRepository.findById(id);
    if (!existing) {
      throw new AppError('Facility not found', 404);
    }
    // Soft-delete to preserve historical attribution of encounters/referrals.
    return facilityRepository.update(id, { isActive: false });
  },
};
