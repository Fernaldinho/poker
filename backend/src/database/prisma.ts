import { PrismaClient } from '@prisma/client';

/**
 * Instância única do PrismaClient.
 * Em desenvolvimento o global evita múltiplas conexões com hot reload.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  console.log('[database] Conexão com PostgreSQL (Supabase) estabelecida');
}
