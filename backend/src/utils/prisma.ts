import { PrismaClient } from '@prisma/client';

// In development, don't use global cache to avoid stale connections
// This ensures Prisma Client is recreated with fresh environment variables
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    // In production, use global singleton for connection pooling
    const globalForPrisma = global as unknown as { prisma: PrismaClient };
    prisma = globalForPrisma.prisma || new PrismaClient({
        log: ['error'],
    });
    globalForPrisma.prisma = prisma;
} else {
    // In development, always create a new instance to pick up .env changes
    prisma = new PrismaClient({
        log: ['query', 'error', 'warn'],
    });
}

export { prisma };


