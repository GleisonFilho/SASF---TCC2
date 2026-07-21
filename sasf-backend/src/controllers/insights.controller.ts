import { Request, Response, NextFunction } from 'express';
import { healthInsightService } from '../services/healthInsight.service';

export const insightsController = {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const insights = await healthInsightService.generate(req.params.membroId as string, (req as any).user.userId);
      res.json(insights);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },

  async score(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await healthInsightService.calculateScore(req.params.membroId as string, (req as any).user.userId);
      res.json(result);
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ error: err.message }); return; }
      next(err);
    }
  },
};
