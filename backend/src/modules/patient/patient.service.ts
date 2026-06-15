import { Prisma } from '@prisma/client';
import { patientRepository } from './patient.repository';
import { CreatePatientInput, UpdatePatientInput, ListPatientQuery } from './patient.schema';
import { createSuspectedFromRegistration } from '../case/case-generation.service';
import { AppError } from '../../helper/app-error';
import { parsePagination, buildPaginationMeta } from '../../helper/pagination';
import { buildContainsOr } from '../../helper/text-search';
import { AuthUser } from '../../types';
import { logger } from '../../helper/logger';

/** Generate a municipality-wide patient code, e.g. "LOPEZ-2026-0001". */
async function generatePatientCode(): Promise<string> {
  const year = new Date().getFullYear();
  const total = await patientRepository.countAll();
  const sequence = String(total + 1).padStart(4, '0');
  return `LOPEZ-${year}-${sequence}`;
}

export const patientService = {
  async list(query: ListPatientQuery) {
    const where: Prisma.PatientWhereInput = {};

    if (query.barangayId) where.barangayId = query.barangayId;
    if (query.facilityId) where.homeFacilityId = query.facilityId;
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    if (query.search) {
      const term = query.search.trim();
      where.OR = buildContainsOr(
        ['firstName', 'lastName', 'patientCode', 'philhealthNo'],
        term
      );
    }

    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const [items, total] = await patientRepository.findManyPaginated(where, skip, limit);

    return { items, pagination: buildPaginationMeta(page, limit, total) };
  },

  async getById(id: string, options?: { includeEncounters?: boolean }) {
    const record = await patientRepository.findById(id, options);
    if (!record) {
      throw new AppError('Patient not found', 404);
    }
    return record;
  },

  async create(input: CreatePatientInput, user: AuthUser) {
    const patientCode = await generatePatientCode();
    const { barangayId, homeFacilityId, consentGiven, identifiers, initialDiseaseId, ...rest } = input;

    const data: Prisma.PatientCreateInput = {
      ...rest,
      patientCode,
      identifiers: identifiers ?? [],
      consentGiven: consentGiven ?? false,
      consentDate: consentGiven ? new Date() : null,
      registeredBy: { connect: { id: user.id } },
    };
    if (barangayId) data.barangay = { connect: { id: barangayId } };
    if (homeFacilityId) data.homeFacility = { connect: { id: homeFacilityId } };

    const patient = await patientRepository.create(data);

    if (initialDiseaseId && barangayId) {
      try {
        await createSuspectedFromRegistration(
          {
            id: patient.id,
            birthDate: patient.birthDate,
            sex: patient.sex,
            barangayId,
          },
          initialDiseaseId,
          user.id
        );
      } catch (error) {
        logger.error('Failed to auto-generate SUSPECTED case from registration', error);
      }
    }

    return patient;
  },

  async update(id: string, input: UpdatePatientInput) {
    const existing = await patientRepository.findRawById(id);
    if (!existing) {
      throw new AppError('Patient not found', 404);
    }

    const { barangayId, homeFacilityId, consentGiven, ...rest } = input;
    const data: Prisma.PatientUpdateInput = { ...rest };

    if (barangayId !== undefined) {
      data.barangay = barangayId ? { connect: { id: barangayId } } : { disconnect: true };
    }
    if (homeFacilityId !== undefined) {
      data.homeFacility = homeFacilityId ? { connect: { id: homeFacilityId } } : { disconnect: true };
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
