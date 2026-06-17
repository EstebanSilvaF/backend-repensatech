import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

function resolveStatusCode(err: AppError): number {
  if (err.statusCode) return err.statusCode;

  const msg = err.message.toLowerCase();

  if (msg.includes('credenciales') || msg.includes('token')) return 401;
  if (msg.includes('no encontrado') || msg.includes('no encontrada')) return 404;
  if (msg.includes('no tienes acceso') || msg.includes('restringido')) return 403;

  return 400;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = resolveStatusCode(err);
  const message = err.message || 'Error interno del servidor';

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({ message });
}

export function createHttpError(statusCode: number, message: string): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
}
