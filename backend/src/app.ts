import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { router } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { cors } from './middlewares/live';
import { pagination } from './utils/pagination';
import { config } from './config';
import { connectDatabase } from './database/prisma';
import { verifySupabaseConnection } from './storage/supabase';

/**
 * Cria e configura a aplicação Express.
 */
export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(config.isProduction ? 'combined' : 'dev'));
  app.use(pagination);

  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 1000,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { success: false, error: 'Muitas requisições. Tente novamente mais tarde.' },
    })
  );

  app.use('/api', router);

  // 404
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Rota não encontrada' });
  });

  app.use(errorHandler);
  return app;
}

export async function startServer(): Promise<void> {
  await connectDatabase();
  await verifySupabaseConnection();

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`[server] API rodando em http://localhost:${config.port} (${config.env})`);
  });
}
