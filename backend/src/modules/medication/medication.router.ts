import { Router } from 'express';
import { medicationController } from './medication.controller';
import {
  createMedicationSchema,
  updateMedicationSchema,
  listMedicationQuerySchema,
} from './medication.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { CLINICAL_ROLES } from '../../configuration/constants';

const router = Router();

router.use(authenticate);
router.use(authorize(...CLINICAL_ROLES));

router.get('/', validate(listMedicationQuerySchema, 'query'), asyncHandler(medicationController.list));
router.post('/', validate(createMedicationSchema), asyncHandler(medicationController.create));
router.put('/:id', validate(updateMedicationSchema), asyncHandler(medicationController.update));
router.delete('/:id', asyncHandler(medicationController.remove));

export default router;
