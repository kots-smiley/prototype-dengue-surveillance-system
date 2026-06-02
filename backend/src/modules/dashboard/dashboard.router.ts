import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { statsQuerySchema, trendsQuerySchema, rankingsQuerySchema } from './dashboard.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';

const router = Router();

router.use(authenticate);

router.get('/stats', validate(statsQuerySchema, 'query'), asyncHandler(dashboardController.stats));
router.get('/trends', validate(trendsQuerySchema, 'query'), asyncHandler(dashboardController.trends));
router.get(
  '/rankings',
  validate(rankingsQuerySchema, 'query'),
  asyncHandler(dashboardController.rankings)
);
router.get(
  '/disease-breakdown',
  validate(statsQuerySchema, 'query'),
  asyncHandler(dashboardController.diseaseBreakdown)
);
router.get(
  '/barangay-cases',
  validate(statsQuerySchema, 'query'),
  asyncHandler(dashboardController.barangayCases)
);

export default router;
