import { Router } from 'express';
import { hieController } from './hie.controller';
import { hieAccessQuerySchema } from './hie.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { CLINICAL_ROLES } from '../../configuration/constants';

const router = Router();

router.use(authenticate);
router.use(authorize(...CLINICAL_ROLES));

// Consent-gated cross-facility patient record (audited).
router.get(
  '/patients/:id/record',
  validate(hieAccessQuerySchema, 'query'),
  asyncHandler(hieController.getSharedRecord)
);

export default router;
