import { Request, Response } from 'express';
import { SessionService } from '../services/SessionService';
import { HandService } from '../services/HandService';
import { StorageService } from '../services/StorageService';

/**
 * Controllers de Sessions.
 * Camada fina: traduz HTTP para o serviço.
 * Métodos em arrow function para preservar o `this` no Express.
 */
export class SessionController {
  private sessions = new SessionService();
  private hands = new HandService();
  private storage = new StorageService();

  list = async (req: Request, res: Response): Promise<void> => {
    const { page = 1, pageSize = 20, status, tableId, search, isLive } = req.query;
    const result = await this.sessions.list({
      page: Number(page),
      pageSize: Number(pageSize),
      status: status as string | undefined,
      tableId: tableId as string | undefined,
      search: search as string | undefined,
      isLive: isLive === 'true' ? true : isLive === 'false' ? false : undefined,
    });
    res.json({ success: true, data: result });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const session = await this.sessions.getById(req.params.id);
    res.json({ success: true, data: session });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const session = await this.sessions.create(req.body);
    res.status(201).json({ success: true, data: session });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const session = await this.sessions.update(req.params.id, req.body);
    res.json({ success: true, data: session });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.sessions.remove(req.params.id);
    res.json({ success: true });
  };

  startLive = async (req: Request, res: Response): Promise<void> => {
    const session = await this.sessions.startLive(req.params.id);
    res.json({ success: true, data: session });
  };

  stopLive = async (req: Request, res: Response): Promise<void> => {
    const session = await this.sessions.stopLive(req.params.id, req.body?.cashOut);
    res.json({ success: true, data: session });
  };

  listHands = async (req: Request, res: Response): Promise<void> => {
    const { page = 1, pageSize = 50 } = req.query;
    const hands = await this.hands.listBySession(
      req.params.id,
      Number(page),
      Number(pageSize)
    );
    res.json({ success: true, data: hands });
  };

  createHand = async (req: Request, res: Response): Promise<void> => {
    const hand = await this.hands.create({ sessionId: req.params.id, ...req.body });
    res.status(201).json({ success: true, data: hand });
  };

  listUploads = async (req: Request, res: Response): Promise<void> => {
    const uploads = await this.storage.listBySession(req.params.id);
    res.json({ success: true, data: uploads });
  };
}
