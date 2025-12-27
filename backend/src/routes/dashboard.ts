import express from 'express';
import {
  getDashboardStats,
  getCaseTrends,
  getBarangayRankings,
  getMonthlyComparison
} from '../controllers/dashboard';
import { getBarangayCaseData, getTimeSeriesData } from '../controllers/analytics';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/trends', getCaseTrends);
router.get('/rankings', getBarangayRankings);
router.get('/comparison', getMonthlyComparison);
router.get('/barangay-cases', getBarangayCaseData);
router.get('/time-series', getTimeSeriesData);

export default router;


