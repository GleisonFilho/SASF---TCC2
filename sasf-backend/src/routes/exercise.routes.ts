import { Router } from 'express';
import { exerciseController } from '../controllers/exercise.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createExerciseSchema } from '../schemas/exercise.schema';

const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.get('/', exerciseController.list);
router.post('/', validate(createExerciseSchema), exerciseController.create);
router.delete('/:id', exerciseController.delete);
router.get('/weekly-stats', exerciseController.weeklyStats);

export default router;
