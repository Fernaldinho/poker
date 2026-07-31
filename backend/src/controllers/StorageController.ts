import { Request, Response } from 'express';
import { StorageService } from '../services/StorageService';
import { config } from '../config';
import { BadRequestError } from '../utils/AppError';

/** Controllers de Storage (uploads de arquivos). */
export class StorageController {
  private storage = new StorageService();

  upload = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) throw new BadRequestError('Nenhum arquivo enviado');

    const { bucket, path } = req.body as { bucket?: string; path?: string };
    if (!bucket || !path) {
      throw new BadRequestError('Parâmetros `bucket` e `path` são obrigatórios');
    }

    const url = await this.storage.upload({
      bucket,
      path,
      file: req.file.buffer,
      contentType: req.file.mimetype,
      filename: req.file.originalname,
      sessionId: req.body.sessionId,
      handId: req.body.handId,
      type: req.body.type,
    });

    res.status(201).json({ success: true, data: { url, bucket, path } });
  };

  signedUrl = async (req: Request, res: Response): Promise<void> => {
    const { bucket, path, expiresIn } = req.body;
    if (!bucket || !path) throw new BadRequestError('`bucket` e `path` são obrigatórios');
    const url = await this.storage.createSignedUrl(bucket, path, Number(expiresIn ?? 3600));
    res.json({ success: true, data: { url } });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { bucket, path } = req.body;
    if (!bucket || !path) throw new BadRequestError('`bucket` e `path` são obrigatórios');
    await this.storage.delete(bucket, path);
    res.json({ success: true });
  };

  buckets = async (_req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      data: [
        config.storage.uploads,
        config.storage.videos,
        config.storage.images,
        config.storage.thumbnails,
        config.storage.sessions,
        config.storage.reports,
        config.storage.imports,
      ],
    });
  };
}
