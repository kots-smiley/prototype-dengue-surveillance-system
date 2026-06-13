import { Prisma } from '@prisma/client';
import { encounterRepository } from './encounter.repository';
import { CreateEncounterInput, UpdateEncounterInput, ListEncounterQuery } from './encounter.schema';
import { patientRepository } from '../patient/patient.repository';
import { generateCasesFromEncounterDiagnoses } from '../case/case-generation.service';
import { syncMedicationsFromEncounter } from '../medication/medication.service';
import { prisma } from '../../configuration/prisma';
import { AppError } from '../../helper/app-error';
import { parsePagination, buildPaginationMeta } from '../../helper/pagination';
import { logger } from '../../helper/logger';
import { AuthUser } from '../../types';

/** Body Mass Index from weight (kg) and height (cm), rounded to 1 decimal. */
function computeBmi(weight?: number | null, height?: number | null): number | undefined {
  if (!weight || !height) return undefined;
  const meters = height / 100;
  if (meters <= 0) return undefined;
  return Math.round((weight / (meters * meters)) * 10) / 10;
}

interface DiagnosisInput {
  diseaseId?: string;
  icd10Code?: string;
  description: string;
  certainty: 'SUSPECTED' | 'PROBABLE' | 'CONFIRMED';
  isPrimary: boolean;
}

interface PrescriptionItemInput {
  drug: string;
  dose?: string | null;
  frequency?: string | null;
  duration?: string | null;
  instructions?: string | null;
}

async function recordEncounterAmendment(
  user: AuthUser,
  encounterId: string,
  summary: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ENCOUNTER_AMENDED',
        resource: 'encounter',
        resourceId: encounterId,
        purposeOfUse: 'TREATMENT',
        facilityId: user.facilityId ?? undefined,
        details: JSON.stringify(summary),
      },
    });
  } catch (error) {
    logger.error('Failed to record encounter amendment audit', error);
  }
}

function buildEncounterScalars(input: CreateEncounterInput | UpdateEncounterInput) {
  return {
    type: input.type,
    encounterDate: input.encounterDate,
    chiefComplaint: input.chiefComplaint,
    subjective: input.subjective,
    objective: input.objective,
    assessment: input.assessment,
    plan: input.plan,
  };
}

async function applyNestedEncounterData(
  encounterId: string,
  input: CreateEncounterInput | UpdateEncounterInput
): Promise<void> {
  if (input.vitalSign) {
    const bmi = computeBmi(input.vitalSign.weight, input.vitalSign.height);
    await prisma.vitalSign.upsert({
      where: { encounterId },
      create: { encounterId, ...input.vitalSign, bmi },
      update: { ...input.vitalSign, bmi },
    });
  } else {
    await prisma.vitalSign.deleteMany({ where: { encounterId } });
  }

  await prisma.diagnosis.deleteMany({ where: { encounterId } });
  if (input.diagnoses.length > 0) {
    await prisma.diagnosis.createMany({
      data: input.diagnoses.map((d) => ({
        encounterId,
        diseaseId: d.diseaseId,
        icd10Code: d.icd10Code,
        snomedCode: d.snomedCode,
        description: d.description,
        certainty: d.certainty ?? 'CONFIRMED',
        isPrimary: d.isPrimary ?? false,
      })),
    });
  }

  await prisma.prescription.deleteMany({ where: { encounterId } });
  if (input.prescriptions.length > 0) {
    for (const p of input.prescriptions) {
      await prisma.prescription.create({
        data: { encounterId, items: p.items, notes: p.notes },
      });
    }
  }
}

function flattenPrescriptionItems(
  prescriptions: CreateEncounterInput['prescriptions']
): PrescriptionItemInput[] {
  return prescriptions.flatMap((p) => p.items);
}

export const encounterService = {
  async list(query: ListEncounterQuery) {
    const where: Prisma.EncounterWhereInput = {};
    if (query.patientId) where.patientId = query.patientId;
    if (query.type) where.type = query.type;

    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const [items, total] = await encounterRepository.findManyPaginated(where, skip, limit);
    return { items, pagination: buildPaginationMeta(page, limit, total) };
  },

  async getById(id: string) {
    const record = await encounterRepository.findById(id);
    if (!record) {
      throw new AppError('Encounter not found', 404);
    }
    return record;
  },

  async create(input: CreateEncounterInput, user: AuthUser) {
    const patient = await patientRepository.findRawById(input.patientId);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }
    if (!patient.isActive) {
      throw new AppError('Cannot create an encounter for an archived patient', 400);
    }
    if (!patient.consentGiven) {
      throw new AppError('Patient consent is required before recording an encounter', 403);
    }

    const barangayId = input.barangayId ?? patient.barangayId ?? null;
    const facilityId = input.facilityId ?? user.facilityId ?? patient.homeFacilityId ?? null;
    const encounterDate = input.encounterDate ?? new Date();

    const data: Prisma.EncounterCreateInput = {
      patient: { connect: { id: input.patientId } },
      clinician: { connect: { id: user.id } },
      ...buildEncounterScalars(input),
      encounterDate,
    };

    if (barangayId) data.barangay = { connect: { id: barangayId } };
    if (facilityId) data.facility = { connect: { id: facilityId } };

    if (input.vitalSign) {
      const bmi = computeBmi(input.vitalSign.weight, input.vitalSign.height);
      data.vitalSign = { create: { ...input.vitalSign, bmi } };
    }

    if (input.diagnoses.length > 0) {
      data.diagnoses = {
        create: input.diagnoses.map((d) => ({
          diseaseId: d.diseaseId,
          icd10Code: d.icd10Code,
          snomedCode: d.snomedCode,
          description: d.description,
          certainty: d.certainty,
          isPrimary: d.isPrimary,
        })),
      };
    }

    if (input.prescriptions.length > 0) {
      data.prescriptions = {
        create: input.prescriptions.map((p) => ({ items: p.items, notes: p.notes })),
      };
    }

    const encounter = await encounterRepository.create(data);

    const rxItems = flattenPrescriptionItems(input.prescriptions);
    if (rxItems.length > 0) {
      try {
        await syncMedicationsFromEncounter(patient.id, encounter.id, rxItems);
      } catch (error) {
        logger.error('Failed to sync medications from encounter', error);
      }
    }

    try {
      await generateCasesFromEncounterDiagnoses({
        diagnoses: input.diagnoses,
        patient: {
          id: patient.id,
          birthDate: patient.birthDate,
          sex: patient.sex,
          barangayId: patient.barangayId,
        },
        barangayId,
        facilityId,
        encounterId: encounter.id,
        encounterDate,
        reportedBy: user.id,
      });
    } catch (error) {
      logger.error('Failed to auto-generate surveillance case from encounter', error);
    }

    return encounter;
  },

  async update(id: string, input: UpdateEncounterInput, user: AuthUser) {
    const existing = await encounterRepository.findById(id);
    if (!existing) {
      throw new AppError('Encounter not found', 404);
    }

    const patient = await patientRepository.findRawById(existing.patientId);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    const barangayId = input.barangayId ?? existing.barangayId ?? patient.barangayId ?? null;
    const facilityId = input.facilityId ?? existing.facilityId ?? user.facilityId ?? null;
    const encounterDate = input.encounterDate ?? existing.encounterDate;

    await prisma.$transaction(async () => {
      await encounterRepository.update(id, {
        ...buildEncounterScalars(input),
        encounterDate,
        ...(barangayId ? { barangay: { connect: { id: barangayId } } } : {}),
        ...(facilityId ? { facility: { connect: { id: facilityId } } } : {}),
      });
      await applyNestedEncounterData(id, input);
    });

    const rxItems = flattenPrescriptionItems(input.prescriptions);
    if (rxItems.length > 0) {
      try {
        await syncMedicationsFromEncounter(patient.id, id, rxItems);
      } catch (error) {
        logger.error('Failed to sync medications from amended encounter', error);
      }
    }

    try {
      await generateCasesFromEncounterDiagnoses({
        diagnoses: input.diagnoses,
        patient: {
          id: patient.id,
          birthDate: patient.birthDate,
          sex: patient.sex,
          barangayId: patient.barangayId,
        },
        barangayId,
        facilityId,
        encounterId: id,
        encounterDate,
        reportedBy: user.id,
        skipIfEncounterCaseExists: true,
      });
    } catch (error) {
      logger.error('Failed to auto-generate surveillance case from amended encounter', error);
    }

    await recordEncounterAmendment(user, id, {
      type: input.type,
      diagnosisCount: input.diagnoses.length,
      prescriptionCount: input.prescriptions.length,
    });

    return encounterRepository.findById(id);
  },

  async remove(id: string) {
    const existing = await encounterRepository.findById(id);
    if (!existing) {
      throw new AppError('Encounter not found', 404);
    }
    await encounterRepository.delete(id);
  },
};
