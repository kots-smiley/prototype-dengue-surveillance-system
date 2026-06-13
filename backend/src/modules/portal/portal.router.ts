import { Router } from 'express';
import { portalController } from './portal.controller';
import { portalConsentSchema } from './portal.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { UserRole } from '../../configuration/constants';

const router = Router();

// Patient self-service portal — scoped to the linked patient record.
router.use(authenticate);
router.use(authorize(UserRole.ADMIN)); // Portal module disabled — RHU/clinic staff only

router.get('/me', asyncHandler(portalController.myRecord));
router.get('/me/consents', asyncHandler(portalController.myConsents));
router.post('/me/consents', validate(portalConsentSchema), asyncHandler(portalController.createConsent));
router.put('/me/consents/:id/revoke', asyncHandler(portalController.revokeConsent));

export default router;
