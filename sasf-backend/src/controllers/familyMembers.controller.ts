import { Request, Response, NextFunction } from 'express';
import { familyMembersService } from '../services/familyMembers.service';

export const familyMembersController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await familyMembersService.list((req as any).user.userId);
      res.json(members);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await familyMembersService.getById(req.params.id as string, (req as any).user.userId);
      res.json(member);
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
      const member = await familyMembersService.create((req as any).user.userId, req.body);
      res.status(201).json(member);
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
      const member = await familyMembersService.update(req.params.id as string, (req as any).user.userId, req.body);
      res.json(member);
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
      await familyMembersService.delete(req.params.id as string, (req as any).user.userId);
      res.json({ message: 'Membro removido com sucesso.' });
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      next(err);
    }
  },
};
