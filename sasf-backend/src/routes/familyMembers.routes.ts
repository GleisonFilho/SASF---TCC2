import { Router } from 'express';
import { familyMembersController } from '../controllers/familyMembers.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createFamilyMemberSchema, updateFamilyMemberSchema } from '../schemas/familyMember.schema';

const router = Router();

router.use(authMiddleware);

router.get('/', familyMembersController.list);
router.post('/', validate(createFamilyMemberSchema), familyMembersController.create);
router.get('/:id', familyMembersController.getById);
router.put('/:id', validate(updateFamilyMemberSchema), familyMembersController.update);
router.delete('/:id', familyMembersController.delete);

export default router;
