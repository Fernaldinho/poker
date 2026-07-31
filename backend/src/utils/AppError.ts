/** Erro de domínio com status HTTP e detalhes opcionais. */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado') {
    super(404, message);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Requisição inválida', details?: unknown) {
    super(400, message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflito com recurso existente') {
    super(409, message);
  }
}
