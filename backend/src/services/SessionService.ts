import { SessionRepository, SessionFilters } from '../repositories/SessionRepository';
import { NotFoundError } from '../utils/AppError';

/**
 * Serviço de Sessions: regras de negócio de sessões de poker.
 */
export class SessionService {
  private repository = new SessionRepository();

  async list(filters: SessionFilters) {
    return this.repository.findWithFilters(filters);
  }

  async getById(id: string) {
    const session = await this.repository.findByIdWithDetails(id);
    if (!session) throw new NotFoundError('Sessão não encontrada');
    return session;
  }

  async create(data: {
    title: string;
    description?: string;
    tableId?: string;
    status?: string;
    buyIn?: number;
    stakes?: string;
    location?: string;
  }) {
    return this.repository.create({
      ...data,
      status: data.status ?? 'ACTIVE',
      buyIn: data.buyIn ?? 0,
    });
  }

  async update(id: string, data: Record<string, unknown>) {
    await this.getById(id);
    return this.repository.update(id, data);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repository.delete(id);
    return { success: true };
  }

  /** Marca sessão como ao vivo (captura em tempo real). */
  async startLive(id: string) {
    const session = await this.repository.update(id, {
      status: 'LIVE',
      isLive: true,
      startedAt: new Date().toISOString(),
    });
    return session;
  }

  /** Finaliza sessão ao vivo e calcula resultado. */
  async stopLive(id: string, cashOut?: number) {
    const session = await this.getById(id);
    const finalCashOut = cashOut ?? Number(session.cashOut ?? 0);
    const durationMs = Date.now() - new Date(session.startedAt).getTime();
    return this.repository.update(id, {
      status: 'COMPLETED',
      isLive: false,
      endedAt: new Date().toISOString(),
      cashOut: finalCashOut,
      profitLoss: Number(finalCashOut) - Number(session.buyIn ?? 0),
      durationMinutes: Math.max(0, Math.round(durationMs / 60000)),
    });
  }
}
