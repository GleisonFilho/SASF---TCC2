import { Router } from 'express';
import { symptomsController } from '../controllers/symptoms.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createSymptomSchema } from '../schemas/symptom.schema';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', symptomsController.list);
router.post('/', validate(createSymptomSchema), symptomsController.create);
router.get('/:id', symptomsController.getById);
router.delete('/:id', symptomsController.delete);

export default router;
