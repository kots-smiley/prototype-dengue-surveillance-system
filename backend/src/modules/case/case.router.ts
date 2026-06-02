import { Router } from 'express';
import { caseController } from './case.controller';
import { createCaseSchema, updateCaseSchema, listCaseQuerySchema } from './case.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { UserRole } from '../../configuration/constants';

const router = Router();

router.use(authenticate);

router.get('/', validate(listCaseQuerySchema, 'query'), asyncHandler(caseController.list));
router.get('/:id', asyncHandler(caseController.getById));

router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.BHW, UserRole.HOSPITAL_ENCODER),
  validate(createCaseSchema),
  asyncHandler(caseController.create)
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.BHW, UserRole.HOSPITAL_ENCODER),
  validate(updateCaseSchema),
  asyncHandler(caseController.update)
);

router.delete('/:id', authorize(UserRole.ADMIN), asyncHandler(caseController.remove));

export default router;
