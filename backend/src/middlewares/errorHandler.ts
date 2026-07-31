import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

/**
 * Tratamento global de erros.
 * Em produção, detalhes internos são omitidos.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.details,
    });
    return;
  }

  if (err instanceof SyntaxError) {
    res.status(400).json({ success: false, error: 'JSON inválido no corpo da requisição' });
    return;
  }

  console.error('[error]', err);
  const message =
    process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : String(err);
  res.status(500).json({ success: false, error: message });
}
