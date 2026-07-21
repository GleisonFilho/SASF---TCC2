import { Request, Response, NextFunction } from 'express';
import { conditionsService } from '../services/conditions.service';

export const conditionsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const conditions = await conditionsService.list(
        req.params.membroId as string,
        (req as any).user.userId,
      );
      res.json(conditions);
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const condition = await conditionsService.getById(
        req.params.id as string,
        req.params.membroId as string,
        (req as any).user.userId,
      );
      res.json(condition);
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const condition = await conditionsService.create(
        req.params.membroId as string,
        (req as any).user.userId,
        req.body,
      );
      res.status(201).json(condition);
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const condition = await conditionsService.update(
        req.params.id as string,
        req.params.membroId as string,
        (req as any).user.userId,
        req.body,
      );
      res.json(condition);
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await conditionsService.delete(
        req.params.id as string,
        req.params.membroId as string,
        (req as any).user.userId,
      );
      res.json({ message: 'Condição de saúde removida com sucesso.' });
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      next(err);
    }
  },
};
