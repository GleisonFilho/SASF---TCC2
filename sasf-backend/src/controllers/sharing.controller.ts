import { Request, Response, NextFunction } from 'express';
import { sharingService } from '../services/sharing.service';

export const sharingController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await sharingService.list((req as any).user.userId);
      res.json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await sharingService.getById(req.params.id as string, (req as any).user.userId);
      res.json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await sharingService.create((req as any).user.userId, req.ip || undefined, req.body);
      res.status(201).json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async revoke(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await sharingService.revoke(req.params.id as string, (req as any).user.userId, req.ip || undefined);
      res.json({ message: 'Compartilhamento revogado com sucesso.', token: result });
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async getAccessLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await sharingService.getAccessLogs(req.params.id as string, (req as any).user.userId);
      res.json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async accessByToken(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await sharingService.accessByToken(req.params.token as string, (req as any).user.userId, req.ip || undefined);
      res.json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async listProfessionalTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await sharingService.listProfessionalTokens((req as any).user.userId);
      res.json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },
};
