import { Prisma } from '@prisma/client';
import { prisma } from '../../configuration/prisma';
import {
  CreateMedicationInput,
  UpdateMedicationInput,
  ListMedicationQuery,
} from './medication.schema';
import { AppError } from '../../helper/app-error';

export interface PrescriptionItemInput {
  drug: string;
  dose?: string | null;
  frequency?: string | null;
  duration?: string | null;
  instructions?: string | null;
}

/** Sync active medications from encounter prescription items. */
export async function syncMedicationsFromEncounter(
  patientId: string,
  encounterId: string,
  items: PrescriptionItemInput[]
): Promise<void> {
  for (const item of items) {
    if (!item.drug.trim()) continue;
    const drug = item.drug.trim();
    const activeMeds = await prisma.medication.findMany({
      where: { patientId, status: 'ACTIVE' },
    });
    const existing = activeMeds.find((m) => m.drug.toLowerCase() === drug.toLowerCase());
    if (existing) {
      await prisma.medication.update({
        where: { id: existing.id },
        data: {
          encounterId,
          dose: item.dose ?? existing.dose,
          frequency: item.frequency ?? existing.frequency,
        },
      });
    } else {
      await prisma.medication.create({
        data: {
          patientId,
          encounterId,
          drug,
          dose: item.dose ?? undefined,
          frequency: item.frequency ?? undefined,
          notes: item.instructions ?? undefined,
          status: 'ACTIVE',
        },
      });
    }
  }
}

export const medicationService = {
  async list(query: ListMedicationQuery) {
    const where: Prisma.MedicationWhereInput = {};
    if (query.patientId) where.patientId = query.patientId;
    if (query.status) where.status = query.status;
    return prisma.medication.findMany({ where, orderBy: { startDate: 'desc' } });
  },

  async create(input: CreateMedicationInput) {
    const { patientId, ...rest } = input;
    return prisma.medication.create({
      data: { ...rest, patient: { connect: { id: patientId } } },
    });
  },

  async update(id: string, input: UpdateMedicationInput) {
    const existing = await prisma.medication.findUnique({ where: { id } });
    if (!existing) throw new AppError('Medication not found', 404);
    const data: Prisma.MedicationUpdateInput = { ...input };
    if (input.status === 'DISCONTINUED' && !input.endDate) {
      data.endDate = new Date();
    }
    return prisma.medication.update({ where: { id }, data });
  },

  async remove(id: string) {
    const existing = await prisma.medication.findUnique({ where: { id } });
    if (!existing) throw new AppError('Medication not found', 404);
    await prisma.medication.delete({ where: { id } });
  },
};
