import { Prisma } from '@prisma/client';
import { prisma } from '../../configuration/prisma';
import {
  CreateAllergyInput,
  CreateProblemInput,
  UpdateProblemInput,
  ListClinicalQuery,
  CreateHistoryInput,
} from './clinical.schema';
import { AppError } from '../../helper/app-error';

export const clinicalService = {
  // --- Allergies ---
  async listAllergies(query: ListClinicalQuery) {
    const where: Prisma.AllergyWhereInput = {};
    if (query.patientId) where.patientId = query.patientId;
    return prisma.allergy.findMany({ where, orderBy: { createdAt: 'desc' } });
  },

  async createAllergy(input: CreateAllergyInput) {
    const { patientId, ...rest } = input;
    return prisma.allergy.create({ data: { ...rest, patient: { connect: { id: patientId } } } });
  },

  async removeAllergy(id: string) {
    const existing = await prisma.allergy.findUnique({ where: { id } });
    if (!existing) throw new AppError('Allergy not found', 404);
    await prisma.allergy.delete({ where: { id } });
  },

  // --- Problems ---
  async listProblems(query: ListClinicalQuery) {
    const where: Prisma.ProblemWhereInput = {};
    if (query.patientId) where.patientId = query.patientId;
    return prisma.problem.findMany({ where, orderBy: { createdAt: 'desc' } });
  },

  async createProblem(input: CreateProblemInput) {
    const { patientId, ...rest } = input;
    return prisma.problem.create({ data: { ...rest, patient: { connect: { id: patientId } } } });
  },

  async updateProblem(id: string, input: UpdateProblemInput) {
    const existing = await prisma.problem.findUnique({ where: { id } });
    if (!existing) throw new AppError('Problem not found', 404);
    return prisma.problem.update({ where: { id }, data: input });
  },

  async removeProblem(id: string) {
    const existing = await prisma.problem.findUnique({ where: { id } });
    if (!existing) throw new AppError('Problem not found', 404);
    await prisma.problem.delete({ where: { id } });
  },

  // --- Medical history ---
  async listHistory(query: ListClinicalQuery) {
    const where: Prisma.MedicalHistoryEntryWhereInput = {};
    if (query.patientId) where.patientId = query.patientId;
    if (query.category) where.category = query.category;
    return prisma.medicalHistoryEntry.findMany({ where, orderBy: { createdAt: 'desc' } });
  },

  async createHistory(input: CreateHistoryInput) {
    const { patientId, ...rest } = input;
    return prisma.medicalHistoryEntry.create({
      data: { ...rest, patient: { connect: { id: patientId } } },
    });
  },

  async removeHistory(id: string) {
    const existing = await prisma.medicalHistoryEntry.findUnique({ where: { id } });
    if (!existing) throw new AppError('History entry not found', 404);
    await prisma.medicalHistoryEntry.delete({ where: { id } });
  },
};
