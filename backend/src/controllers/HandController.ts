import { Request, Response } from 'express';
import { HandService } from '../services/HandService';
import { StorageService } from '../services/StorageService';
import { BadRequestError } from '../utils/AppError';

/** Controllers de Hands (mãos individuais). */
export class HandController {
  private hands = new HandService();
  private storage = new StorageService();

  getById = async (req: Request, res: Response): Promise<void> => {
    const hand = await this.hands.getById(req.params.id);
    res.json({ success: true, data: hand });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const hand = await this.hands.update(req.params.id, req.body);
    res.json({ success: true, data: hand });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.hands.remove(req.params.id);
    res.json({ success: true });
  };
}
