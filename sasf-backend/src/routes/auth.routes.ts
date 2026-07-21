import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, registerProfessionalSchema, loginSchema, refreshSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/register/professional', validate(registerProfessionalSchema), authController.registerProfessional);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);

export default router;
