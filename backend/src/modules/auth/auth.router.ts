import { Router } from 'express';
import { authController } from './auth.controller';
import { loginSchema, registerSchema, changePasswordSchema } from './auth.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { UserRole } from '../../configuration/constants';

const router = Router();

router.post('/login', validate(loginSchema), asyncHandler(authController.login));

router.post(
  '/register',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(registerSchema),
  asyncHandler(authController.register)
);

router.get('/me', authenticate, asyncHandler(authController.me));

router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword)
);

export default router;
