import { Prisma } from '@prisma/client';
import { prisma } from '../../configuration/prisma';

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
} satisfies Prisma.UserSelect;

const threadInclude = {
  barangay: true,
  creator: { select: userSelect },
  messages: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    include: { sender: { select: userSelect } },
  },
  _count: { select: { messages: true } },
} satisfies Prisma.FeedbackThreadInclude;

const threadDetailInclude = {
  barangay: true,
  creator: { select: userSelect },
  messages: {
    orderBy: { createdAt: 'asc' as const },
    include: { sender: { select: userSelect } },
  },
} satisfies Prisma.FeedbackThreadInclude;

export const feedbackRepository = {
  findManyPaginated(where: Prisma.FeedbackThreadWhereInput, skip: number, take: number) {
    return prisma.$transaction([
      prisma.feedbackThread.findMany({
        where,
        include: threadInclude,
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take,
      }),
      prisma.feedbackThread.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.feedbackThread.findUnique({ where: { id }, include: threadDetailInclude });
  },

  findRawById(id: string) {
    return prisma.feedbackThread.findUnique({ where: { id } });
  },

  createThread(data: {
    subject: string;
    barangayId: string;
    createdById: string;
    body: string;
  }) {
    return prisma.feedbackThread.create({
      data: {
        subject: data.subject,
        barangay: { connect: { id: data.barangayId } },
        creator: { connect: { id: data.createdById } },
        messages: {
          create: {
            body: data.body,
            sender: { connect: { id: data.createdById } },
          },
        },
      },
      include: threadDetailInclude,
    });
  },

  addMessage(threadId: string, senderId: string, body: string) {
    return prisma.$transaction([
      prisma.feedbackMessage.create({
        data: {
          body,
          thread: { connect: { id: threadId } },
          sender: { connect: { id: senderId } },
        },
        include: { sender: { select: userSelect } },
      }),
      prisma.feedbackThread.update({
        where: { id: threadId },
        data: { lastMessageAt: new Date() },
      }),
    ]);
  },

  markMessagesRead(threadId: string, readerId: string) {
    return prisma.feedbackMessage.updateMany({
      where: {
        threadId,
        senderId: { not: readerId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  },

  countUnreadForUser(userId: string, threadWhere: Prisma.FeedbackThreadWhereInput) {
    return prisma.feedbackMessage.count({
      where: {
        readAt: null,
        senderId: { not: userId },
        thread: threadWhere,
      },
    });
  },

  countUnreadInThread(threadId: string, userId: string) {
    return prisma.feedbackMessage.count({
      where: {
        threadId,
        readAt: null,
        senderId: { not: userId },
      },
    });
  },

  updateThreadStatus(id: string, status: string) {
    return prisma.feedbackThread.update({
      where: { id },
      data: { status },
      include: threadDetailInclude,
    });
  },
};
