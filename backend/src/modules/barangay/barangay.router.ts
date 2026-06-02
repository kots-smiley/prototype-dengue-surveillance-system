import { Router } from 'express';
import { barangayController } from './barangay.controller';
import {
  createBarangaySchema,
  updateBarangaySchema,
  listBarangayQuerySchema,
} from './barangay.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { UserRole } from '../../configuration/constants';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate(listBarangayQuerySchema, 'query'),
  asyncHandler(barangayController.list)
);
router.get('/:id', asyncHandler(barangayController.getById));

router.post(
  '/',
  authorize(UserRole.ADMIN),
  validate(createBarangaySchema),
  asyncHandler(barangayController.create)
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validate(updateBarangaySchema),
  asyncHandler(barangayController.update)
);

router.delete('/:id', authorize(UserRole.ADMIN), asyncHandler(barangayController.remove));

export default router;
