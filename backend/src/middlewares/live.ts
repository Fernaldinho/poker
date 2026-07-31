import { NextFunction, Request, Response } from 'express';

/** Ações disparadas ao vivo via Supabase Realtime. */
export interface LiveAction {
  entity: 'session' | 'hand' | 'statistic' | 'upload' | 'note';
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: unknown;
}

const listeners = new Set<(action: LiveAction) => void>();

/** Registra um callback para ações ao vivo (processamento assíncrono). */
export function onLiveAction(listener: (action: LiveAction) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Notifica listeners internos. Usado por serviços que processam dados ao vivo. */
export function emitLiveAction(action: LiveAction): void {
  listeners.forEach((listener) => listener(action));
}

/**
 * Middleware CORS permissivo para desenvolvimento.
 */
export function cors(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (_req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
}
