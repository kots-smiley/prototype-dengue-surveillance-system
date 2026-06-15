import { Router } from 'express';
import { riskReportController } from './risk-report.controller';
import {
  createRiskReportSchema,
  updateRiskReportSchema,
  listRiskReportQuerySchema,
  reviewRiskReportSchema,
} from './risk-report.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { UserRole } from '../../configuration/constants';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate(listRiskReportQuerySchema, 'query'),
  asyncHandler(riskReportController.list)
);
router.get('/:id', asyncHandler(riskReportController.getById));

router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.BHW),
  validate(createRiskReportSchema),
  asyncHandler(riskReportController.create)
);

router.patch(
  '/:id/status',
  authorize(UserRole.ADMIN, UserRole.HEALTH_OFFICER, UserRole.BHW),
  validate(reviewRiskReportSchema),
  asyncHandler(riskReportController.review)
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.BHW),
  validate(updateRiskReportSchema),
  asyncHandler(riskReportController.update)
);

router.delete('/:id', authorize(UserRole.ADMIN, UserRole.BHW), asyncHandler(riskReportController.remove));

export default router;
