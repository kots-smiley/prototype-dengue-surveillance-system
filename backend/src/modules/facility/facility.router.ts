import { Router } from 'express';
import { facilityController } from './facility.controller';
import {
  createFacilitySchema,
  updateFacilitySchema,
  listFacilityQuerySchema,
} from './facility.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { UserRole } from '../../configuration/constants';

const router = Router();

router.use(authenticate);

// Any authenticated user can read the facility registry (needed for dropdowns/context).
router.get('/', validate(listFacilityQuerySchema, 'query'), asyncHandler(facilityController.list));
router.get('/:id', asyncHandler(facilityController.getById));

// Only municipality-level admins manage the facility registry.
router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.HEALTH_OFFICER),
  validate(createFacilitySchema),
  asyncHandler(facilityController.create)
);
router.put(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.HEALTH_OFFICER),
  validate(updateFacilitySchema),
  asyncHandler(facilityController.update)
);
router.delete(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.HEALTH_OFFICER),
  asyncHandler(facilityController.remove)
);

export default router;
