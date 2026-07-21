import { Request, Response, NextFunction } from 'express';
import { medicationsService } from '../services/medications.service';

export const medicationsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await medicationsService.list(req.params.membroId as string, (req as any).user.userId);
      res.json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await medicationsService.getById(req.params.id as string, req.params.membroId as string, (req as any).user.userId);
      res.json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await medicationsService.create(req.params.membroId as string, (req as any).user.userId, req.body);
      res.status(201).json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await medicationsService.update(req.params.id as string, req.params.membroId as string, (req as any).user.userId, req.body);
      res.json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await medicationsService.delete(req.params.id as string, req.params.membroId as string, (req as any).user.userId);
      res.json({ message: 'Medicamento removido com sucesso.' });
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },
};
