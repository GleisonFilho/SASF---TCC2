import { Router } from 'express';
import { emergencyContactsController } from '../controllers/emergencyContacts.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createEmergencyContactSchema, updateEmergencyContactSchema } from '../schemas/emergencyContact.schema';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', emergencyContactsController.list);
router.post('/', validate(createEmergencyContactSchema), emergencyContactsController.create);
router.get('/:id', emergencyContactsController.getById);
router.put('/:id', validate(updateEmergencyContactSchema), emergencyContactsController.update);
router.delete('/:id', emergencyContactsController.delete);

export default router;
