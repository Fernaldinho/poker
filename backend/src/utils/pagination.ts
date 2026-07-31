import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';

/**
 * Middleware de suporte a paginação.
 * Lê `page` e `pageSize` da query e anexa em res.locals.
 */
export function pagination(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(req.query.pageSize) || 20)
  );
  res.locals.pagination = { page, pageSize, skip: (page - 1) * pageSize };
  next();
}

/** Serializa Decimal do Prisma para number. */
export function serializeDecimals<T extends Record<string, unknown>>(
  record: T
): T {
  const result: Record<string, unknown> = { ...record };
  for (const key of Object.keys(result)) {
    if (result[key] instanceof Prisma.Decimal) {
      result[key] = (result[key] as Prisma.Decimal).toNumber();
    }
  }
  return result as T;
}

/** Converte filtro de busca textual para busca Prisma. */
export function buildSearchFilter(fields: string[], search?: string) {
  if (!search) return {};
  return {
    OR: fields.map((field) => ({
      [field]: { contains: search, mode: 'insensitive' as const },
    })),
  };
}
