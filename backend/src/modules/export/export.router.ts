import { Router } from 'express';
import { exportController } from './export.controller';
import {
  exportCasesQuerySchema,
  exportReportsQuerySchema,
  exportSummaryQuerySchema,
} from './export.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { UserRole } from '../../configuration/constants';

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN, UserRole.BHW));

router.get('/cases', validate(exportCasesQuerySchema, 'query'), asyncHandler(exportController.cases));
router.get(
  '/reports',
  validate(exportReportsQuerySchema, 'query'),
  asyncHandler(exportController.reports)
);
router.get(
  '/summary',
  validate(exportSummaryQuerySchema, 'query'),
  asyncHandler(exportController.summary)
);

export default router;
