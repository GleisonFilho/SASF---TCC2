import { Request, Response, NextFunction } from 'express';
import { psychologyService } from '../services/psychology.service';

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

export const psychologyController = {
  list: h(async (req, res) => { res.json(await psychologyService.list(mid(req), uid(req))); }),
  create: h(async (req, res) => { res.status(201).json(await psychologyService.create(mid(req), uid(req), req.body)); }),
  delete: h(async (req, res) => {
    await psychologyService.delete(req.params.id as string, mid(req), uid(req));
    res.json({ message: 'Registro removido.' });
  }),
};
