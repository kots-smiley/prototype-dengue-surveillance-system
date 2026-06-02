import { PrismaClient } from '@prisma/client';

/**
 * Single shared Prisma client.
 * In production we cache it on the global object to reuse the connection pool
 * across hot reloads / serverless invocations.
 */
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
