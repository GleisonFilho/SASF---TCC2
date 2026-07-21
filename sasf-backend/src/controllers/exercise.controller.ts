import { Request, Response, NextFunction } from 'express';
import { exerciseService } from '../services/exercise.service';

function h(fn: (req: Request, res: Response) => Promise<void>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try { await fn(req, res); } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  };
}

const uid = (req: Request) => (req as any).user.userId;
const mid = (req: Request) => req.params.membroId as string;

export const exerciseController = {
  list: h(async (req, res) => { res.json(await exerciseService.list(mid(req), uid(req))); }),
  create: h(async (req, res) => { res.status(201).json(await exerciseService.create(mid(req), uid(req), req.body)); }),
  delete: h(async (req, res) => {
    await exerciseService.delete(req.params.id as string, mid(req), uid(req));
    res.json({ message: 'Exercício removido.' });
  }),
  weeklyStats: h(async (req, res) => { res.json(await exerciseService.weeklyStats(mid(req), uid(req))); }),
};
