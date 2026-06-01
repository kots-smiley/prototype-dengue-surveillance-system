import { Router } from 'express';
import { diseaseController } from './disease.controller';
import {
  createDiseaseSchema,
  updateDiseaseSchema,
  listDiseaseQuerySchema,
} from './disease.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { UserRole } from '../../configuration/constants';

const router = Router();

router.use(authenticate);

router.get('/', validate(listDiseaseQuerySchema, 'query'), asyncHandler(diseaseController.list));
router.get('/:id', asyncHandler(diseaseController.getById));

router.post(
  '/',
  authorize(UserRole.ADMIN),
  validate(createDiseaseSchema),
  asyncHandler(diseaseController.create)
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validate(updateDiseaseSchema),
  asyncHandler(diseaseController.update)
);

router.delete('/:id', authorize(UserRole.ADMIN), asyncHandler(diseaseController.remove));

export default router;
