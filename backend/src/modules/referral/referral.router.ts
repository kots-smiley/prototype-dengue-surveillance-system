import { Router } from 'express';
import { referralController } from './referral.controller';
import {
  createReferralSchema,
  updateReferralStatusSchema,
  listReferralQuerySchema,
} from './referral.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { CLINICAL_ROLES } from '../../configuration/constants';

const router = Router();

router.use(authenticate);
router.use(authorize(...CLINICAL_ROLES));

router.get('/', validate(listReferralQuerySchema, 'query'), asyncHandler(referralController.list));
router.post('/', validate(createReferralSchema), asyncHandler(referralController.create));
router.put('/:id/status', validate(updateReferralStatusSchema), asyncHandler(referralController.updateStatus));

export default router;
