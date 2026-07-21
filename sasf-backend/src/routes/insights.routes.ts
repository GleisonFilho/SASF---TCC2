import { Router } from 'express';
import { insightsController } from '../controllers/insights.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.get('/', insightsController.generate);
router.get('/score', insightsController.score);

export default router;
