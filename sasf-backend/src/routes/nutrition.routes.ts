import { Router } from 'express';
import { nutritionController } from '../controllers/nutrition.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { upsertProfileSchema, createWeightSchema, createWaterSchema, createMealSchema, createMealPlanSchema, updateMealPlanSchema } from '../schemas/nutrition.schema';

const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.get('/profile', nutritionController.getProfile);
router.put('/profile', validate(upsertProfileSchema), nutritionController.upsertProfile);

router.get('/weight', nutritionController.listWeight);
router.post('/weight', validate(createWeightSchema), nutritionController.createWeight);
router.delete('/weight/:id', nutritionController.deleteWeight);

router.get('/water', nutritionController.listWater);
router.post('/water', validate(createWaterSchema), nutritionController.createWater);
router.delete('/water/:id', nutritionController.deleteWater);

router.get('/meals', nutritionController.listMeals);
router.post('/meals', validate(createMealSchema), nutritionController.createMeal);
router.delete('/meals/:id', nutritionController.deleteMeal);

router.get('/meal-plans', nutritionController.listMealPlans);
router.post('/meal-plans', validate(createMealPlanSchema), nutritionController.createMealPlan);
router.put('/meal-plans/:id', validate(updateMealPlanSchema), nutritionController.updateMealPlan);

export default router;
