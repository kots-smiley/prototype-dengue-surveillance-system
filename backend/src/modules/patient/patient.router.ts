import { Router } from 'express';
import { patientController } from './patient.controller';
import { createPatientSchema, updatePatientSchema, listPatientQuerySchema } from './patient.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { CLINICAL_ROLES, UserRole } from '../../configuration/constants';

const router = Router();

// Patient records carry PII — restricted to clinical roles + ADMIN.
router.use(authenticate);
router.use(authorize(...CLINICAL_ROLES));

router.get('/', validate(listPatientQuerySchema, 'query'), asyncHandler(patientController.list));
router.get('/:id', asyncHandler(patientController.getById));

router.post('/', validate(createPatientSchema), asyncHandler(patientController.create));
router.put('/:id', validate(updatePatientSchema), asyncHandler(patientController.update));
router.delete('/:id', authorize(UserRole.ADMIN, UserRole.PHYSICIAN), asyncHandler(patientController.remove));

export default router;
