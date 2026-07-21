import { Request, Response, NextFunction } from 'express';
import { allergiesService } from '../services/allergies.service';

export const allergiesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await allergiesService.list(req.params.membroId as string, (req as any).user.userId);
      res.json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await allergiesService.getById(req.params.id as string, req.params.membroId as string, (req as any).user.userId);
      res.json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await allergiesService.create(req.params.membroId as string, (req as any).user.userId, req.body);
      res.status(201).json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await allergiesService.update(req.params.id as string, req.params.membroId as string, (req as any).user.userId, req.body);
      res.json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await allergiesService.delete(req.params.id as string, req.params.membroId as string, (req as any).user.userId);
      res.json({ message: 'Alergia removida com sucesso.' });
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },
};
