import { Prisma } from '@prisma/client';
import { alertRepository } from './alert.repository';
import { ListAlertQuery, UpdateAlertStatusInput } from './alert.schema';
import { AppError } from '../../helper/app-error';
import { AlertStatus } from '../../configuration/constants';
import { parsePagination, buildPaginationMeta } from '../../helper/pagination';
import { AuthUser } from '../../types';

export const alertService = {
  async list(query: ListAlertQuery, user: AuthUser) {
    const where: Prisma.AlertWhereInput = {};

    if (user.role === 'BHW' && user.barangayId) {
      where.barangayId = user.barangayId;
    } else if (query.barangayId) {
      where.barangayId = query.barangayId;
    }

    if (query.diseaseId) where.diseaseId = query.diseaseId;
    if (query.status) where.status = query.status;
    if (query.riskLevel) where.riskLevel = query.riskLevel;

    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const [items, total] = await alertRepository.findManyPaginated(where, skip, limit);

    return { items, pagination: buildPaginationMeta(page, limit, total) };
  },

  async getById(id: string, user: AuthUser) {
    const alert = await alertRepository.findById(id);
    if (!alert) {
      throw new AppError('Alert not found', 404);
    }
    if (user.role === 'BHW' && alert.barangayId !== user.barangayId) {
      throw new AppError('Access denied', 403);
    }
    return alert;
  },

  async updateStatus(id: string, input: UpdateAlertStatusInput) {
    const alert = await alertRepository.findRawById(id);
    if (!alert) {
      throw new AppError('Alert not found', 404);
    }

    const data: Prisma.AlertUpdateInput = { status: input.status };
    if (input.status === AlertStatus.RESOLVED && !alert.resolvedAt) {
      data.resolvedAt = new Date();
    }
    return alertRepository.update(id, data);
  },

  async resolve(id: string) {
    const alert = await alertRepository.findRawById(id);
    if (!alert) {
      throw new AppError('Alert not found', 404);
    }
    return alertRepository.update(id, {
      status: AlertStatus.RESOLVED,
      resolvedAt: new Date(),
    });
  },
};
