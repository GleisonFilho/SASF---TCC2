import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateProfileSchema } from '../schemas/users.schema';

const router = Router();

router.put('/me', authMiddleware, validate(updateProfileSchema), usersController.updateMe);

export default router;
