import express from 'express';
import {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport
} from '../controllers/reports';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

router.use(authenticate);

router.get('/', getReports);
router.get('/:id', getReportById);
router.post('/', authorize(UserRole.ADMIN, UserRole.BHW, UserRole.RESIDENT), createReport);
router.put('/:id', authorize(UserRole.ADMIN, UserRole.BHW), updateReport);
router.delete('/:id', authorize(UserRole.ADMIN), deleteReport);

export default router;


