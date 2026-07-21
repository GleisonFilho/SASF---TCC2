import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/checkRole.middleware';
import { validate } from '../middlewares/validate.middleware';
import { rejectProfessionalSchema } from '../schemas/admin.schema';

const router = Router();

router.use(authMiddleware);
router.use(checkRole('ADMIN'));

router.get('/professionals', adminController.listProfessionals);
router.get('/professionals/:id', adminController.getProfessional);
router.patch('/professionals/:id/approve', adminController.approve);
router.patch('/professionals/:id/reject', validate(rejectProfessionalSchema), adminController.reject);

export default router;
