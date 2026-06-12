import { Prisma } from '@prisma/client';
import { prisma } from '../../configuration/prisma';
import { CreateDocumentInput, ListDocumentQuery } from './document.schema';
import { AppError } from '../../helper/app-error';
import { AuthUser } from '../../types';

export const documentService = {
  async list(query: ListDocumentQuery) {
    const where: Prisma.ClinicalDocumentWhereInput = {};
    if (query.patientId) where.patientId = query.patientId;
    if (query.encounterId) where.encounterId = query.encounterId;
    const documents = await prisma.clinicalDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return { documents };
  },

  async create(input: CreateDocumentInput, user: AuthUser) {
    const { patientId, encounterId, ...rest } = input;
    const data: Prisma.ClinicalDocumentCreateInput = {
      ...rest,
      createdById: user.id,
      patient: { connect: { id: patientId } },
    };
    if (encounterId) data.encounter = { connect: { id: encounterId } };
    return prisma.clinicalDocument.create({ data });
  },

  async remove(id: string) {
    const existing = await prisma.clinicalDocument.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Document not found', 404);
    }
    await prisma.clinicalDocument.delete({ where: { id } });
  },
};
