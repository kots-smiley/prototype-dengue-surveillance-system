import { Router } from 'express';
import { fhirController } from './fhir.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { CLINICAL_ROLES } from '../../configuration/constants';

const router = Router();

router.use(authenticate);
router.use(authorize(...CLINICAL_ROLES));

// HL7 FHIR R4 read endpoints (return raw FHIR JSON, not the API envelope).
// Note: Express treats `$` as a path anchor, so operation routes omit the prefix.
router.get('/Patient/:id/everything', asyncHandler(fhirController.everything));
router.get('/Patient/:id/summary', asyncHandler(fhirController.summary));
router.get('/Patient/:id', asyncHandler(fhirController.getPatient));

// Inbound FHIR Bundle (PHIE / external system) — minimal import.
router.post('/', asyncHandler(fhirController.importBundle));

export default router;
