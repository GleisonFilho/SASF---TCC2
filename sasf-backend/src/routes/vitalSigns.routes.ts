import { Router } from 'express';
import { vitalSignsController } from '../controllers/vitalSigns.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createVitalSignSchema } from '../schemas/vitalSign.schema';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', vitalSignsController.list);
router.post('/', validate(createVitalSignSchema), vitalSignsController.create);
router.get('/:id', vitalSignsController.getById);
router.delete('/:id', vitalSignsController.delete);

export default router;
