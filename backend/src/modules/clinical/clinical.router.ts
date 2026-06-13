import { Router } from 'express';
import { clinicalController } from './clinical.controller';
import {
  createAllergySchema,
  createProblemSchema,
  updateProblemSchema,
  listClinicalQuerySchema,
  createHistorySchema,
} from './clinical.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { CLINICAL_ROLES } from '../../configuration/constants';

const router = Router();

router.use(authenticate);
router.use(authorize(...CLINICAL_ROLES));

// Allergies
router.get('/allergies', validate(listClinicalQuerySchema, 'query'), asyncHandler(clinicalController.listAllergies));
router.post('/allergies', validate(createAllergySchema), asyncHandler(clinicalController.createAllergy));
router.delete('/allergies/:id', asyncHandler(clinicalController.removeAllergy));

// Problem list
router.get('/problems', validate(listClinicalQuerySchema, 'query'), asyncHandler(clinicalController.listProblems));
router.post('/problems', validate(createProblemSchema), asyncHandler(clinicalController.createProblem));
router.put('/problems/:id', validate(updateProblemSchema), asyncHandler(clinicalController.updateProblem));
router.delete('/problems/:id', asyncHandler(clinicalController.removeProblem));

router.get('/history', validate(listClinicalQuerySchema, 'query'), asyncHandler(clinicalController.listHistory));
router.post('/history', validate(createHistorySchema), asyncHandler(clinicalController.createHistory));
router.delete('/history/:id', asyncHandler(clinicalController.removeHistory));

export default router;
