import { Router } from 'express';
import { allergiesController } from '../controllers/allergies.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createAllergySchema, updateAllergySchema } from '../schemas/allergy.schema';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', allergiesController.list);
router.post('/', validate(createAllergySchema), allergiesController.create);
router.get('/:id', allergiesController.getById);
router.put('/:id', validate(updateAllergySchema), allergiesController.update);
router.delete('/:id', allergiesController.delete);

export default router;
