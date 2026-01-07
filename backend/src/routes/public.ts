import express from 'express';
import {
  getPublicDashboardStats,
  getPublicBarangayCaseData,
  getPublicTimeSeriesData,
  getPublicAlerts,
  getPublicForecastSummary
} from '../controllers/public';

const router = express.Router();

// Dashboard/analytics (public mirrors)
router.get('/dashboard/stats', getPublicDashboardStats);
router.get('/dashboard/barangay-cases', getPublicBarangayCaseData);
router.get('/dashboard/time-series', getPublicTimeSeriesData);

// Alerts (public read-only)
router.get('/alerts', getPublicAlerts);

// Forecast summary (single call for public website)
router.get('/forecast/summary', getPublicForecastSummary);

export default router;


