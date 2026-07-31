import { Session } from '@prisma/client';
import { prisma } from '../database/prisma';
import { BaseRepository } from './BaseRepository';

export interface SessionFilters {
  status?: string;
  tableId?: string;
  isLive?: boolean;
  search?: string;
  page: number;
  pageSize: number;
}

/**
 * Repository de Sessions.
 * Consultas otimizadas com paginação, filtros e busca.
 */
export class SessionRepository extends BaseRepository<Session> {
  protected model = {
    findMany: (args: any) => prisma.session.findMany(args),
    findUnique: (args: any) => prisma.session.findUnique(args),
    findFirst: (args: any) => prisma.session.findFirst(args),
    create: (args: any) => prisma.session.create(args),
    update: (args: any) => prisma.session.update(args),
    delete: (args: any) => prisma.session.delete(args),
    count: (args?: any) => prisma.session.count(args),
  };

  async findWithFilters(filters: SessionFilters) {
    const where: any = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.tableId ? { tableId: filters.tableId } : {}),
      ...(filters.isLive !== undefined ? { isLive: filters.isLive } : {}),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: 'insensitive' } },
              { location: { contains: filters.search, mode: 'insensitive' } },
              { stakes: { contains: filters.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.session.findMany({
        where,
        include: { table: true, _count: { select: { hands: true, uploads: true } } },
        orderBy: { startedAt: 'desc' },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.session.count({ where }),
    ]);

    return {
      items,
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: Math.ceil(total / filters.pageSize),
    };
  }

  async findByIdWithDetails(id: string) {
    return prisma.session.findUnique({
      where: { id },
      include: {
        table: true,
        hands: { orderBy: { handNumber: 'asc' } },
        uploads: true,
        notes: true,
        statistics: true,
      },
    });
  }
}
