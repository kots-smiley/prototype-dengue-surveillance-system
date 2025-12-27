import express from 'express';
import { exportCases, exportReports, exportSummary } from '../controllers/exports';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

router.use(authenticate);

router.get('/cases', authorize(UserRole.ADMIN, UserRole.BHW), exportCases);
router.get('/reports', authorize(UserRole.ADMIN, UserRole.BHW), exportReports);
router.get('/summary', authorize(UserRole.ADMIN), exportSummary);

export default router;


