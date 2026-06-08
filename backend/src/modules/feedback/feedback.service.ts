import { Prisma } from '@prisma/client';
import { feedbackRepository } from './feedback.repository';
import {
  CreateFeedbackThreadInput,
  ReplyFeedbackThreadInput,
  ListFeedbackQuery,
} from './feedback.schema';
import { barangayRepository } from '../barangay/barangay.repository';
import { AppError } from '../../helper/app-error';
import { FeedbackThreadStatus, UserRole } from '../../configuration/constants';
import { parsePagination, buildPaginationMeta } from '../../helper/pagination';
import { AuthUser } from '../../types';

function buildThreadWhere(user: AuthUser, query: ListFeedbackQuery): Prisma.FeedbackThreadWhereInput {
  const where: Prisma.FeedbackThreadWhereInput = {};

  if (user.role === UserRole.BHW && user.barangayId) {
    where.barangayId = user.barangayId;
  } else if (query.barangayId) {
    where.barangayId = query.barangayId;
  }

  if (query.status) {
    where.status = query.status;
  }

  return where;
}

function assertThreadAccess(thread: { barangayId: string }, user: AuthUser) {
  if (user.role === UserRole.BHW && thread.barangayId !== user.barangayId) {
    throw new AppError('Access denied', 403);
  }
}

export const feedbackService = {
  async list(query: ListFeedbackQuery, user: AuthUser) {
    const where = buildThreadWhere(user, query);
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const [threads, total] = await feedbackRepository.findManyPaginated(where, skip, limit);

    const items = await Promise.all(
      threads.map(async (thread) => {
        const unreadCount = await feedbackRepository.countUnreadInThread(thread.id, user.id);
        const latestMessage = thread.messages[0] ?? null;
        const { messages: _messages, ...rest } = thread;
        return { ...rest, latestMessage, unreadCount };
      })
    );

    return { items, pagination: buildPaginationMeta(page, limit, total) };
  },

  async getById(id: string, user: AuthUser) {
    const thread = await feedbackRepository.findById(id);
    if (!thread) {
      throw new AppError('Feedback thread not found', 404);
    }

    assertThreadAccess(thread, user);
    await feedbackRepository.markMessagesRead(id, user.id);

    const refreshed = await feedbackRepository.findById(id);
    return refreshed!;
  },

  async create(input: CreateFeedbackThreadInput, user: AuthUser) {
    let barangayId = input.barangayId;

    if (user.role === UserRole.BHW) {
      if (!user.barangayId) {
        throw new AppError('BHW is not assigned to a barangay', 403);
      }
      barangayId = user.barangayId;
    } else if (user.role === UserRole.ADMIN) {
      if (!barangayId) {
        throw new AppError('Barangay is required', 400);
      }
    } else {
      throw new AppError('Only barangay health workers and RHU administrators can send feedback', 403);
    }

    const barangay = await barangayRepository.findById(barangayId);
    if (!barangay) {
      throw new AppError('Barangay not found', 404);
    }

    return feedbackRepository.createThread({
      subject: input.subject,
      body: input.body,
      barangayId,
      createdById: user.id,
    });
  },

  async reply(id: string, input: ReplyFeedbackThreadInput, user: AuthUser) {
    const thread = await feedbackRepository.findRawById(id);
    if (!thread) {
      throw new AppError('Feedback thread not found', 404);
    }

    assertThreadAccess(thread, user);

    if (thread.status === FeedbackThreadStatus.CLOSED) {
      throw new AppError('This thread is closed', 400);
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.BHW) {
      throw new AppError('Access denied', 403);
    }

    await feedbackRepository.addMessage(id, user.id, input.body);
    return feedbackRepository.findById(id);
  },

  async close(id: string, user: AuthUser) {
    const thread = await feedbackRepository.findRawById(id);
    if (!thread) {
      throw new AppError('Feedback thread not found', 404);
    }

    assertThreadAccess(thread, user);

    if (user.role !== UserRole.ADMIN && thread.createdById !== user.id) {
      throw new AppError('Access denied', 403);
    }

    return feedbackRepository.updateThreadStatus(id, FeedbackThreadStatus.CLOSED);
  },

  async reopen(id: string, user: AuthUser) {
    const thread = await feedbackRepository.findRawById(id);
    if (!thread) {
      throw new AppError('Feedback thread not found', 404);
    }

    assertThreadAccess(thread, user);

    if (user.role !== UserRole.ADMIN && thread.createdById !== user.id) {
      throw new AppError('Access denied', 403);
    }

    return feedbackRepository.updateThreadStatus(id, FeedbackThreadStatus.OPEN);
  },

  async getUnreadCount(user: AuthUser) {
    const where = buildThreadWhere(user, {});
    const count = await feedbackRepository.countUnreadForUser(user.id, where);
    return { count };
  },
};
