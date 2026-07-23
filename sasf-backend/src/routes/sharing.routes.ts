import { Router } from 'express';
import { sharingController } from '../controllers/sharing.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createSharingSchema, createNoteSchema } from '../schemas/sharing.schema';

const router = Router();

router.get('/sharing', authMiddleware, sharingController.list);
router.post('/sharing', authMiddleware, validate(createSharingSchema), sharingController.create);
router.get('/sharing/:id', authMiddleware, sharingController.getById);
router.patch('/sharing/:id/revoke', authMiddleware, sharingController.revoke);
router.get('/sharing/:id/logs', authMiddleware, sharingController.getAccessLogs);

router.get('/professional/shared-access', authMiddleware, sharingController.listProfessionalTokens);
router.get('/professional/access/:token', authMiddleware, sharingController.accessByToken);
router.get('/professional/access/:token/notes', authMiddleware, sharingController.listNotes);
router.post('/professional/access/:token/notes', authMiddleware, validate(createNoteSchema), sharingController.createNote);
router.delete('/professional/notes/:id', authMiddleware, sharingController.deleteNote);

export default router;
