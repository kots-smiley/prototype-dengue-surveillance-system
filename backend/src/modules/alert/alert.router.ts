import { Router } from 'express';
import { alertController } from './alert.controller';
import { updateAlertStatusSchema, listAlertQuerySchema } from './alert.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { UserRole } from '../../configuration/constants';

const router = Router();

router.use(authenticate);

router.get('/', validate(listAlertQuerySchema, 'query'), asyncHandler(alertController.list));
router.get('/:id', asyncHandler(alertController.getById));

router.put(
  '/:id/status',
  authorize(UserRole.ADMIN, UserRole.BHW),
  validate(updateAlertStatusSchema),
  asyncHandler(alertController.updateStatus)
);

router.put(
  '/:id/resolve',
  authorize(UserRole.ADMIN, UserRole.BHW),
  asyncHandler(alertController.resolve)
);

export default router;
