import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';

export const reportController = {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportService.generate(req.params.membroId as string, (req as any).user.userId);
      res.json(report);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },
};
