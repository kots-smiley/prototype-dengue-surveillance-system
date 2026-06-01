import { Prisma } from '@prisma/client';
import { caseRepository } from './case.repository';
import { CreateCaseInput, UpdateCaseInput, ListCaseQuery } from './case.schema';
import { diseaseRepository } from '../disease/disease.repository';
import { earlyWarningService } from '../early-warning/early-warning.service';
import { AppError } from '../../helper/app-error';
import { parsePagination, buildPaginationMeta } from '../../helper/pagination';
import { AuthUser } from '../../types';

/** Fire-and-forget early warning recheck. */
function scheduleEarlyWarning(barangayId: string, diseaseId: string): void {
  setImmediate(() => {
    void earlyWarningService.runCheck(barangayId, diseaseId);
  });
}

export const caseService = {
  async list(query: ListCaseQuery, user: AuthUser) {
    const where: Prisma.CaseWhereInput = {};

    // BHWs are scoped to their assigned barangay.
    if (user.role === 'BHW' && user.barangayId) {
      where.barangayId = user.barangayId;
    } else if (query.barangayId) {
      where.barangayId = query.barangayId;
    }

    if (query.diseaseId) where.diseaseId = query.diseaseId;
    if (query.status) where.status = query.status;
    if (query.source) where.source = query.source;
    if (query.startDate || query.endDate) {
      where.dateReported = {};
      if (query.startDate) where.dateReported.gte = query.startDate;
      if (query.endDate) where.dateReported.lte = query.endDate;
    }

    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const [items, total] = await caseRepository.findManyPaginated(where, skip, limit);

    return { items, pagination: buildPaginationMeta(page, limit, total) };
  },

  async getById(id: string, user: AuthUser) {
    const record = await caseRepository.findById(id);
    if (!record) {
      throw new AppError('Case not found', 404);
    }
    if (user.role === 'BHW' && record.barangayId !== user.barangayId) {
      throw new AppError('Access denied', 403);
    }
    return record;
  },

  async create(input: CreateCaseInput, user: AuthUser) {
    const disease = await diseaseRepository.findById(input.diseaseId);
    if (!disease) {
      throw new AppError('Disease not found', 404);
    }

    if (user.role === 'BHW' && input.barangayId !== user.barangayId) {
      throw new AppError('BHW can only create cases for their assigned barangay', 403);
    }

    const { diseaseId, barangayId, ...rest } = input;
    const record = await caseRepository.create({
      ...rest,
      age: input.age ?? 0,
      ageGroup: input.ageGroup ?? 'N/A',
      disease: { connect: { id: diseaseId } },
      barangay: { connect: { id: barangayId } },
      reporter: { connect: { id: user.id } },
    });

    scheduleEarlyWarning(barangayId, diseaseId);
    return record;
  },

  async update(id: string, input: UpdateCaseInput, user: AuthUser) {
    const existing = await caseRepository.findRawById(id);
    if (!existing) {
      throw new AppError('Case not found', 404);
    }

    if (user.role === 'BHW') {
      if (existing.barangayId !== user.barangayId) {
        throw new AppError('Access denied', 403);
      }
      if (input.barangayId && input.barangayId !== user.barangayId) {
        throw new AppError('BHW can only update cases for their assigned barangay', 403);
      }
    }

    const { diseaseId, barangayId, ...rest } = input;
    const data: Prisma.CaseUpdateInput = { ...rest };
    if (diseaseId) data.disease = { connect: { id: diseaseId } };
    if (barangayId) data.barangay = { connect: { id: barangayId } };

    const updated = await caseRepository.update(id, data);

    scheduleEarlyWarning(barangayId ?? existing.barangayId, diseaseId ?? existing.diseaseId);
    return updated;
  },

  async remove(id: string) {
    const existing = await caseRepository.findRawById(id);
    if (!existing) {
      throw new AppError('Case not found', 404);
    }
    await caseRepository.delete(id);
    scheduleEarlyWarning(existing.barangayId, existing.diseaseId);
  },
};
