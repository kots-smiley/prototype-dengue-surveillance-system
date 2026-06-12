import { Router } from 'express';
import { immunizationController } from './immunization.controller';
import {
  createImmunizationSchema,
  updateImmunizationSchema,
  listImmunizationQuerySchema,
} from './immunization.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { CLINICAL_ROLES } from '../../configuration/constants';

const router = Router();

router.use(authenticate);
router.use(authorize(...CLINICAL_ROLES));

router.get('/', validate(listImmunizationQuerySchema, 'query'), asyncHandler(immunizationController.list));
router.post('/', validate(createImmunizationSchema), asyncHandler(immunizationController.create));
router.put('/:id', validate(updateImmunizationSchema), asyncHandler(immunizationController.update));
router.delete('/:id', asyncHandler(immunizationController.remove));

export default router;
