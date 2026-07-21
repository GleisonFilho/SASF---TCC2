import { Router } from 'express';
import { psychologyController } from '../controllers/psychology.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createPsychologySchema } from '../schemas/psychology.schema';

const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.get('/', psychologyController.list);
router.post('/', validate(createPsychologySchema), psychologyController.create);
router.delete('/:id', psychologyController.delete);

export default router;
