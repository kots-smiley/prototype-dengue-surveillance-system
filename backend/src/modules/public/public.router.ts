import { Router } from 'express';
import { publicController } from './public.controller';
import { forecastQuerySchema, timeSeriesQuerySchema } from './public.schema';
import { submitPublicReportSchema } from '../risk-report/risk-report.schema';
import { validate } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../helper/async-handler';

// Public, no-authentication endpoints consumed by the forecast site.
const router = Router();

router.get('/diseases', asyncHandler(publicController.diseases));
router.get('/barangays', asyncHandler(publicController.barangays));
router.post(
  '/reports',
  validate(submitPublicReportSchema),
  asyncHandler(publicController.submitReport)
);
router.get('/stats', asyncHandler(publicController.stats));
router.get(
  '/time-series',
  validate(timeSeriesQuerySchema, 'query'),
  asyncHandler(publicController.timeSeries)
);
router.get(
  '/forecast/summary',
  validate(forecastQuerySchema, 'query'),
  asyncHandler(publicController.forecastSummary)
);

export default router;
