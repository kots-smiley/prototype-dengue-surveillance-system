import { Router } from 'express';
import { consentController } from './consent.controller';
import { createConsentSchema, listConsentQuerySchema } from './consent.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { CLINICAL_ROLES } from '../../configuration/constants';

const router = Router();

router.use(authenticate);
router.use(authorize(...CLINICAL_ROLES));

router.get('/', validate(listConsentQuerySchema, 'query'), asyncHandler(consentController.list));
router.post('/', validate(createConsentSchema), asyncHandler(consentController.create));
router.put('/:id/revoke', asyncHandler(consentController.revoke));

export default router;
