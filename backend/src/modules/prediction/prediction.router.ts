import { Router } from 'express';
import { predictionController } from './prediction.controller';
import { predictionQuerySchema, barangayPredictionQuerySchema } from './prediction.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { UserRole } from '../../configuration/constants';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.BHW, UserRole.HOSPITAL_ENCODER));

router.get('/', validate(predictionQuerySchema, 'query'), asyncHandler(predictionController.getPredictions));
router.get(
  '/barangays',
  validate(barangayPredictionQuerySchema, 'query'),
  asyncHandler(predictionController.getBarangayPredictions)
);

export default router;
