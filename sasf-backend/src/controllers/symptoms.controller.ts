import { Request, Response, NextFunction } from 'express';
import { symptomsService } from '../services/symptoms.service';

export const symptomsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await symptomsService.list(req.params.membroId as string, (req as any).user.userId);
      res.json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await symptomsService.getById(req.params.id as string, req.params.membroId as string, (req as any).user.userId);
      res.json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await symptomsService.create(req.params.membroId as string, (req as any).user.userId, req.body);
      res.status(201).json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await symptomsService.delete(req.params.id as string, req.params.membroId as string, (req as any).user.userId);
      res.json({ message: 'Sintoma removido com sucesso.' });
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },
};
