import { Prisma } from '@prisma/client';
import { riskReportRepository } from './risk-report.repository';
import {
  CreateRiskReportInput,
  UpdateRiskReportInput,
  ListRiskReportQuery,
  ReviewRiskReportInput,
} from './risk-report.schema';
import { barangayRepository } from '../barangay/barangay.repository';
import { earlyWarningService } from '../early-warning/early-warning.service';
import { AppError } from '../../helper/app-error';
import { parsePagination, buildPaginationMeta } from '../../helper/pagination';
import { AuthUser } from '../../types';
import { RiskReportStatus, RiskReportSource, UserRole } from '../../configuration/constants';

function scheduleEarlyWarning(barangayId: string): void {
  setImmediate(() => {
    void earlyWarningService.runCheck(barangayId);
  });
}

const REVIEWER_ROLES = [UserRole.ADMIN, UserRole.HEALTH_OFFICER, UserRole.BHW];

function assertCanReview(user: AuthUser): void {
  if (!REVIEWER_ROLES.includes(user.role as (typeof REVIEWER_ROLES)[number])) {
    throw new AppError('Access denied', 403);
  }
}

export const riskReportService = {
  async list(query: ListRiskReportQuery, user: AuthUser) {
    const where: Prisma.RiskReportWhereInput = {
      status: query.status ?? RiskReportStatus.APPROVED,
    };

    if (user.role === 'BHW' && user.barangayId) {
      where.barangayId = user.barangayId;
    } else if (query.barangayId) {
      where.barangayId = query.barangayId;
    }

    if (query.category) where.category = query.category;
    if (query.startDate || query.endDate) {
      where.dateReported = {};
      if (query.startDate) where.dateReported.gte = query.startDate;
      if (query.endDate) where.dateReported.lte = query.endDate;
    }

    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const [items, total] = await riskReportRepository.findManyPaginated(where, skip, limit);

    return { items, pagination: buildPaginationMeta(page, limit, total) };
  },

  async getById(id: string, user: AuthUser) {
    const report = await riskReportRepository.findById(id);
    if (!report) {
      throw new AppError('Risk report not found', 404);
    }
    if (user.role === 'BHW' && report.barangayId !== user.barangayId) {
      throw new AppError('Access denied', 403);
    }
    return report;
  },

  async create(input: CreateRiskReportInput, user: AuthUser) {
    const barangay = await barangayRepository.findById(input.barangayId);
    if (!barangay) {
      throw new AppError('Barangay not found', 404);
    }
    if (user.role === 'BHW' && input.barangayId !== user.barangayId) {
      throw new AppError('BHW can only create reports for their assigned barangay', 403);
    }

    const { barangayId, photoUrl, ...rest } = input;
    const report = await riskReportRepository.create({
      ...rest,
      status: RiskReportStatus.APPROVED,
      source: RiskReportSource.STAFF,
      dateReported: input.dateReported ?? new Date(),
      photoUrl: photoUrl || undefined,
      barangay: { connect: { id: barangayId } },
      reporter: { connect: { id: user.id } },
    });

    scheduleEarlyWarning(barangayId);
    return report;
  },

  async update(id: string, input: UpdateRiskReportInput, user: AuthUser) {
    const existing = await riskReportRepository.findRawById(id);
    if (!existing) {
      throw new AppError('Risk report not found', 404);
    }

    if (user.role === 'BHW') {
      if (existing.barangayId !== user.barangayId) {
        throw new AppError('Access denied', 403);
      }
      if (input.barangayId && input.barangayId !== user.barangayId) {
        throw new AppError('BHW can only update reports for their assigned barangay', 403);
      }
    }

    const { barangayId, photoUrl, ...rest } = input;
    const data: Prisma.RiskReportUpdateInput = { ...rest };
    if (barangayId) data.barangay = { connect: { id: barangayId } };
    if (photoUrl !== undefined) data.photoUrl = photoUrl || undefined;

    const updated = await riskReportRepository.update(id, data);

    if (existing.status === RiskReportStatus.APPROVED) {
      scheduleEarlyWarning(barangayId ?? existing.barangayId);
    }
    return updated;
  },

  async review(id: string, input: ReviewRiskReportInput, user: AuthUser) {
    assertCanReview(user);

    const existing = await riskReportRepository.findRawById(id);
    if (!existing) {
      throw new AppError('Risk report not found', 404);
    }
    if (existing.status !== RiskReportStatus.PENDING) {
      throw new AppError('Only pending reports can be reviewed', 400);
    }
    if (user.role === UserRole.BHW && existing.barangayId !== user.barangayId) {
      throw new AppError('BHW can only review reports for their assigned barangay', 403);
    }

    const nextStatus =
      input.action === 'approve' ? RiskReportStatus.APPROVED : RiskReportStatus.REJECTED;

    const report = await riskReportRepository.update(id, {
      status: nextStatus,
      reviewedAt: new Date(),
      rejectionReason: input.action === 'reject' ? input.rejectionReason ?? undefined : undefined,
      reviewer: { connect: { id: user.id } },
    });

    if (nextStatus === RiskReportStatus.APPROVED) {
      scheduleEarlyWarning(existing.barangayId);
    }

    return report;
  },

  async remove(id: string) {
    const existing = await riskReportRepository.findRawById(id);
    if (!existing) {
      throw new AppError('Risk report not found', 404);
    }
    await riskReportRepository.delete(id);
    if (existing.status === RiskReportStatus.APPROVED) {
      scheduleEarlyWarning(existing.barangayId);
    }
  },
};
