import { Router } from 'express';
import { userController } from './user.controller';
import { createUserSchema, updateUserSchema, listUserQuerySchema } from './user.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { UserRole } from '../../configuration/constants';

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/', validate(listUserQuerySchema, 'query'), asyncHandler(userController.list));
router.get('/:id', asyncHandler(userController.getById));
router.post('/', validate(createUserSchema), asyncHandler(userController.create));
router.put('/:id', validate(updateUserSchema), asyncHandler(userController.update));
router.delete('/:id', asyncHandler(userController.remove));

export default router;
