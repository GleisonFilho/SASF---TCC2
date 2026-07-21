import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(`[ERROR] ${err.message}`, env.NODE_ENV === 'development' ? err.stack : '');

  res.status(500).json({
    error: 'Erro interno do servidor.',
  });
}
