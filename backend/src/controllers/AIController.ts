import { Request, Response } from 'express';
import { AIService } from '../services/AIService';
import { BadRequestError } from '../utils/AppError';
import { config } from '../config';

/** Controllers de IA (análise de frames de mesa). */
export class AIController {
  private ai = new AIService();

  analyze = async (req: Request, res: Response): Promise<void> => {
    const { imageBase64, mimeType, context } = req.body as {
      imageBase64?: string;
      mimeType?: string;
      context?: Record<string, unknown>;
    };

    if (!imageBase64) throw new BadRequestError('Parâmetro `imageBase64` é obrigatório');

    const imgSizeMb = (imageBase64.length * 0.75) / 1024 / 1024;
    if (imgSizeMb > config.ai.maxImageSizeMb) {
      throw new BadRequestError(
        `Imagem muito grande (${imgSizeMb.toFixed(1)}MB). Máximo: ${config.ai.maxImageSizeMb}MB`
      );
    }

    const suggestion = await this.ai.analyzeFrame({
      imageBase64,
      mimeType,
      context: context as AnalyzeContext,
    });

    res.json({ success: true, data: suggestion });
  };

  status = async (_req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      data: {
        configured: Boolean(config.ai.geminiApiKey || config.ai.zenApiKey),
        provider: config.ai.geminiApiKey ? 'gemini' : config.ai.zenApiKey ? 'zen' : null,
        model: config.ai.model,
      },
    });
  };
}

interface AnalyzeContext {
  stakes?: string;
  buyIn?: number;
  heroCards?: string;
  notes?: string;
}
