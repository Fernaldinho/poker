import { Request, Response } from 'express';
import { SessionTableService } from '../services/SessionTableService';

/** Controllers de SessionTables (mesas de uma sessão). */
export class SessionTableController {
  private tables = new SessionTableService();

  list = async (req: Request, res: Response): Promise<void> => {
    res.json({ success: true, data: await this.tables.listBySession(req.params.sessionId) });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const table = await this.tables.create(req.params.sessionId, req.body?.name);
    res.status(201).json({ success: true, data: table });
  };

  rename = async (req: Request, res: Response): Promise<void> => {
    res.json({ success: true, data: await this.tables.rename(req.params.id, req.body?.name) });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    res.json({ success: true, data: await this.tables.remove(req.params.id) });
  };
}
