import { Hand } from '@prisma/client';
import { prisma } from '../database/prisma';
import { BaseRepository } from './BaseRepository';

/**
 * Repository de Hands (mãos jogadas).
 */
export class HandRepository extends BaseRepository<Hand> {
  protected model = {
    findMany: (args: any) => prisma.hand.findMany(args),
    findUnique: (args: any) => prisma.hand.findUnique(args),
    findFirst: (args: any) => prisma.hand.findFirst(args),
    create: (args: any) => prisma.hand.create(args),
    update: (args: any) => prisma.hand.update(args),
    delete: (args: any) => prisma.hand.delete(args),
    count: (args?: any) => prisma.hand.count(args),
  };

  async findBySession(sessionId: string, page = 1, pageSize = 50) {
    const where = { sessionId };
    const [items, total] = await Promise.all([
      prisma.hand.findMany({
        where,
        orderBy: { handNumber: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.hand.count({ where }),
    ]);
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** Cria mão de forma idempotente (por sessionId + handNumber). */
  async upsertByNumber(
    sessionId: string,
    handNumber: number,
    data: any
  ): Promise<Hand> {
    const existing = await prisma.hand.findUnique({
      where: { sessionId_handNumber: { sessionId, handNumber } },
    });
    if (existing) {
      return prisma.hand.update({
        where: { id: existing.id },
        data: { ...data, id: undefined },
      });
    }
    return prisma.hand.create({
      data: { ...data, sessionId, handNumber } as never,
    });
  }
}
