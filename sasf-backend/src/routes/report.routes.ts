import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.get('/', reportController.generate);

export default router;
