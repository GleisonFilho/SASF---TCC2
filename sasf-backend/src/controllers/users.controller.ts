import { Request, Response, NextFunction } from 'express';
import { usersService } from '../services/users.service';

export const usersController = {
  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const result = await usersService.updateProfile(userId, req.body);
      res.json(result);
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      next(err);
    }
  },
};
