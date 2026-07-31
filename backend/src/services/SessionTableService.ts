import { SessionTableRepository } from '../repositories/SessionTableRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { NotFoundError, BadRequestError } from '../utils/AppError';

/**
 * Serviço de SessionTables: organização de múltiplas mesas por sessão.
 * Permite criar, renomear, listar e remover mesas de uma sessão.
 */
export class SessionTableService {
  private repository = new SessionTableRepository();
  private sessionRepository = new SessionRepository();

  async listBySession(sessionId: string) {
    await this.ensureSession(sessionId);
    const tables = await this.repository.findBySession(sessionId);
    return tables.map((table) => ({
      ...table,
      uploads: (table.uploads ?? []).map((upload) => ({
        ...(upload as Record<string, unknown>),
        sizeBytes: Number((upload as { sizeBytes: bigint | number }).sizeBytes),
      })),
      videoCount: (table.uploads?.length ?? 0) as number,
    }));
  }

  async create(sessionId: string, name?: string) {
    await this.ensureSession(sessionId);
    return this.repository.createNext(sessionId, name);
  }

  async rename(id: string, name: string) {
    if (!name?.trim()) throw new BadRequestError('Nome da mesa é obrigatório');
    await this.ensureTable(id);
    return this.repository.rename(id, name.trim());
  }

  async remove(id: string) {
    await this.ensureTable(id);
    await this.repository.delete(id);
    return { success: true };
  }

  private async ensureSession(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new NotFoundError('Sessão não encontrada');
  }

  private async ensureTable(id: string): Promise<void> {
    const table = await this.repository.findById(id);
    if (!table) throw new NotFoundError('Mesa não encontrada');
  }
}
