import { Prisma } from '@prisma/client';
import { patientRepository } from './patient.repository';
import { CreatePatientInput, UpdatePatientInput, ListPatientQuery } from './patient.schema';
import { AppError } from '../../helper/app-error';
import { parsePagination, buildPaginationMeta } from '../../helper/pagination';
import { AuthUser } from '../../types';

/** Generate a human-readable patient code, e.g. "P-2026-0001". */
async function generatePatientCode(): Promise<string> {
  const year = new Date().getFullYear();
  const total = await patientRepository.countAll();
  const sequence = String(total + 1).padStart(4, '0');
  return `P-${year}-${sequence}`;
}

export const patientService = {
  async list(query: ListPatientQuery) {
    const where: Prisma.PatientWhereInput = {};

    if (query.barangayId) where.barangayId = query.barangayId;
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { patientCode: { contains: term, mode: 'insensitive' } },
      ];
    }

    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const [items, total] = await patientRepository.findManyPaginated(where, skip, limit);

    return { items, pagination: buildPaginationMeta(page, limit, total) };
  },

  async getById(id: string) {
    const record = await patientRepository.findById(id);
    if (!record) {
      throw new AppError('Patient not found', 404);
    }
    return record;
  },

  async create(input: CreatePatientInput, user: AuthUser) {
    const patientCode = await generatePatientCode();
    const { barangayId, consentGiven, ...rest } = input;

    const data: Prisma.PatientCreateInput = {
      ...rest,
      patientCode,
      consentGiven: consentGiven ?? false,
      consentDate: consentGiven ? new Date() : null,
      registeredBy: { connect: { id: user.id } },
    };
    if (barangayId) data.barangay = { connect: { id: barangayId } };

    return patientRepository.create(data);
  },

  async update(id: string, input: UpdatePatientInput) {
    const existing = await patientRepository.findRawById(id);
    if (!existing) {
      throw new AppError('Patient not found', 404);
    }

    const { barangayId, consentGiven, ...rest } = input;
    const data: Prisma.PatientUpdateInput = { ...rest };

    if (barangayId !== undefined) {
      data.barangay = barangayId ? { connect: { id: barangayId } } : { disconnect: true };
    }

    // Stamp consent date the moment consent transitions to granted.
    if (consentGiven !== undefined) {
      data.consentGiven = consentGiven;
      if (consentGiven && !existing.consentGiven) data.consentDate = new Date();
      if (!consentGiven) data.consentDate = null;
    }

    return patientRepository.update(id, data);
  },

  async remove(id: string) {
    const existing = await patientRepository.findRawById(id);
    if (!existing) {
      throw new AppError('Patient not found', 404);
    }
    // Soft-delete to preserve the medical record and any linked surveillance data.
    return patientRepository.update(id, { isActive: false });
  },
};
