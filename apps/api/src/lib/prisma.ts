import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const enableQueryLog =
  process.env.PRISMA_LOG_QUERIES === '1' ||
  (process.env.NODE_ENV === 'development' && process.env.PRISMA_LOG_QUERIES !== '0');

const logLevels: Array<'query' | 'info' | 'warn' | 'error'> = enableQueryLog
  ? ['query', 'warn', 'error']
  : ['warn', 'error'];

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logLevels,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
