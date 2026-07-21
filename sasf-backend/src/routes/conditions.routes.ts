import { Router } from 'express';
import { conditionsController } from '../controllers/conditions.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createConditionSchema, updateConditionSchema } from '../schemas/condition.schema';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', conditionsController.list);
router.post('/', validate(createConditionSchema), conditionsController.create);
router.get('/:id', conditionsController.getById);
router.put('/:id', validate(updateConditionSchema), conditionsController.update);
router.delete('/:id', conditionsController.delete);

export default router;
