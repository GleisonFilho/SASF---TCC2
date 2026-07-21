import { Router } from 'express';
import { medicationsController } from '../controllers/medications.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createMedicationSchema, updateMedicationSchema } from '../schemas/medication.schema';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', medicationsController.list);
router.post('/', validate(createMedicationSchema), medicationsController.create);
router.get('/:id', medicationsController.getById);
router.put('/:id', validate(updateMedicationSchema), medicationsController.update);
router.delete('/:id', medicationsController.delete);

export default router;
