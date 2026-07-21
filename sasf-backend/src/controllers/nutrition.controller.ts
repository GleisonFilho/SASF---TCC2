import { Request, Response, NextFunction } from 'express';
import { nutritionService } from '../services/nutrition.service';

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

export const nutritionController = {
  getProfile: h(async (req, res) => {
    const result = await nutritionService.getProfile(mid(req), uid(req));
    res.json(result || {});
  }),
  upsertProfile: h(async (req, res) => {
    const result = await nutritionService.upsertProfile(mid(req), uid(req), req.body);
    res.json(result);
  }),
  listWeight: h(async (req, res) => {
    res.json(await nutritionService.listWeight(mid(req), uid(req)));
  }),
  createWeight: h(async (req, res) => {
    res.status(201).json(await nutritionService.createWeight(mid(req), uid(req), req.body));
  }),
  deleteWeight: h(async (req, res) => {
    await nutritionService.deleteWeight(req.params.id as string, mid(req), uid(req));
    res.json({ message: 'Registro removido.' });
  }),
  listWater: h(async (req, res) => {
    const date = (req.query.date as string) || new Date().toISOString();
    res.json(await nutritionService.listWater(mid(req), uid(req), date));
  }),
  createWater: h(async (req, res) => {
    res.status(201).json(await nutritionService.createWater(mid(req), uid(req), req.body));
  }),
  deleteWater: h(async (req, res) => {
    await nutritionService.deleteWater(req.params.id as string, mid(req), uid(req));
    res.json({ message: 'Registro removido.' });
  }),
  listMeals: h(async (req, res) => {
    res.json(await nutritionService.listMeals(mid(req), uid(req), req.query.date as string));
  }),
  createMeal: h(async (req, res) => {
    res.status(201).json(await nutritionService.createMeal(mid(req), uid(req), req.body));
  }),
  deleteMeal: h(async (req, res) => {
    await nutritionService.deleteMeal(req.params.id as string, mid(req), uid(req));
    res.json({ message: 'Refeição removida.' });
  }),
  listMealPlans: h(async (req, res) => {
    res.json(await nutritionService.listMealPlans(mid(req), uid(req)));
  }),
  createMealPlan: h(async (req, res) => {
    res.status(201).json(await nutritionService.createMealPlan(uid(req), req.body));
  }),
  updateMealPlan: h(async (req, res) => {
    res.json(await nutritionService.updateMealPlan(req.params.id as string, uid(req), req.body));
  }),
};
