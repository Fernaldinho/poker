import { SessionTable } from '@prisma/client';
import { prisma } from '../database/prisma';
import { BaseRepository } from './BaseRepository';

/**
 * Repository de SessionTables (mesas dentro de uma sessão).
 * Suporta múltiplas mesas por sessão, com posição ordenada.
 */
export class SessionTableRepository extends BaseRepository<SessionTable> {
  protected model = {
    findMany: (args: any) => prisma.sessionTable.findMany(args),
    findUnique: (args: any) => prisma.sessionTable.findUnique(args),
    findFirst: (args: any) => prisma.sessionTable.findFirst(args),
    create: (args: any) => prisma.sessionTable.create(args),
    update: (args: any) => prisma.sessionTable.update(args),
    delete: (args: any) => prisma.sessionTable.delete(args),
    count: (args?: any) => prisma.sessionTable.count(args),
  };

  async findBySession(sessionId: string): Promise<(SessionTable & { uploads: unknown[] })[]> {
    return prisma.sessionTable.findMany({
      where: { sessionId },
      orderBy: { position: 'asc' },
      include: { uploads: true },
    });
  }

  /** Cria mesa na próxima posição disponível da sessão. */
  async createNext(sessionId: string, name?: string): Promise<SessionTable> {
    const count = await prisma.sessionTable.count({ where: { sessionId } });
    const position = count === 0 ? 0 : (await this.findMaxPosition(sessionId)) + 1;
    return prisma.sessionTable.create({
      data: {
        sessionId,
        name: name ?? `Mesa ${position + 1}`,
        position,
        status: 'EMPTY',
      },
    });
  }

  private async findMaxPosition(sessionId: string): Promise<number> {
    const last = await prisma.sessionTable.findFirst({
      where: { sessionId },
      orderBy: { position: 'desc' },
    });
    return last?.position ?? -1;
  }

  async rename(id: string, name: string): Promise<SessionTable> {
    return prisma.sessionTable.update({ where: { id }, data: { name } });
  }
}
