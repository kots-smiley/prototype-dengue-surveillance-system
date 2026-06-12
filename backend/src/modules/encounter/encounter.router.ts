import { Router } from 'express';
import { encounterController } from './encounter.controller';
import { createEncounterSchema, listEncounterQuerySchema } from './encounter.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { CLINICAL_ROLES, UserRole } from '../../configuration/constants';

const router = Router();

// Encounters contain clinical PII — restricted to clinical roles + ADMIN.
router.use(authenticate);
router.use(authorize(...CLINICAL_ROLES));

router.get('/', validate(listEncounterQuerySchema, 'query'), asyncHandler(encounterController.list));
router.get('/:id', asyncHandler(encounterController.getById));

router.post('/', validate(createEncounterSchema), asyncHandler(encounterController.create));
router.delete('/:id', authorize(UserRole.ADMIN, UserRole.PHYSICIAN), asyncHandler(encounterController.remove));

export default router;
