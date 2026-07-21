import { Request, Response, NextFunction } from 'express';
import { vitalSignsService } from '../services/vitalSigns.service';

export const vitalSignsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { tipo, de, ate } = req.query as Record<string, string>;
      const result = await vitalSignsService.list(
        req.params.membroId as string,
        (req as any).user.userId,
        { tipo, de, ate },
      );
      res.json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await vitalSignsService.getById(req.params.id as string, req.params.membroId as string, (req as any).user.userId);
      res.json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await vitalSignsService.create(req.params.membroId as string, (req as any).user.userId, req.body);
      res.status(201).json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await vitalSignsService.delete(req.params.id as string, req.params.membroId as string, (req as any).user.userId);
      res.json({ message: 'Sinal vital removido com sucesso.' });
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },
};
