import { Router } from 'express';
import { sharingController } from '../controllers/sharing.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createSharingSchema } from '../schemas/sharing.schema';

const router = Router();

router.get('/sharing', authMiddleware, sharingController.list);
router.post('/sharing', authMiddleware, validate(createSharingSchema), sharingController.create);
router.get('/sharing/:id', authMiddleware, sharingController.getById);
router.patch('/sharing/:id/revoke', authMiddleware, sharingController.revoke);
router.get('/sharing/:id/logs', authMiddleware, sharingController.getAccessLogs);

router.get('/professional/shared-access', authMiddleware, sharingController.listProfessionalTokens);
router.get('/professional/access/:token', authMiddleware, sharingController.accessByToken);

export default router;
