import { HandRepository } from '../repositories/HandRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { BadRequestError, NotFoundError } from '../utils/AppError';

/**
 * Serviço de Hands: mãos jogadas dentro de sessões.
 * Suporta captura ao vivo (upsert por handNumber).
 */
export class HandService {
  private repository = new HandRepository();
  private sessionRepository = new SessionRepository();

  async listBySession(sessionId: string, page: number, pageSize: number) {
    return this.repository.findBySession(sessionId, page, pageSize);
  }

  async getById(id: string) {
    const hand = await this.repository.findById(id);
    if (!hand) throw new NotFoundError('Mão não encontrada');
    return hand;
  }

  async create(data: {
    sessionId: string;
    handNumber: number;
    players?: number;
    pot?: number;
    cards?: unknown[];
    board?: unknown[];
    winner?: string;
    actions?: unknown[];
    handHistoryRaw?: string;
  }) {
    const session = await this.sessionRepository.findById(data.sessionId);
    if (!session) throw new BadRequestError('Sessão não encontrada');

    const hand = await this.repository.upsertByNumber(data.sessionId, data.handNumber, {
      sessionId: data.sessionId,
      handNumber: data.handNumber,
      players: data.players ?? 0,
      pot: data.pot ?? 0,
      cards: (data.cards ?? []) as object,
      board: (data.board ?? []) as object,
      winner: data.winner,
      actions: (data.actions ?? []) as object,
      handHistoryRaw: data.handHistoryRaw,
    });

    await this.sessionRepository.update(data.sessionId, {
      handsPlayed: { increment: 1 },
    });

    return hand;
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
}
