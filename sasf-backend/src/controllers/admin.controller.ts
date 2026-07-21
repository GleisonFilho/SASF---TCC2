import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';

export const adminController = {
  async listProfessionals(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string | undefined;
      const result = await adminService.listProfessionals(status);
      res.json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async getProfessional(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getProfessional(req.params.id as string);
      res.json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.approve(req.params.id as string, (req as any).user.userId, req.ip || undefined);
      res.json({ message: 'Profissional aprovado com sucesso.', profissional: result });
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.reject(req.params.id as string, (req as any).user.userId, req.body.motivo, req.ip || undefined);
      res.json({ message: 'Profissional rejeitado.', profissional: result });
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },
};
