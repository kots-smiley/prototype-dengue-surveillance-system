import express from 'express';
import {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase
} from '../controllers/cases';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

router.use(authenticate);

router.get('/', getCases);
router.get('/:id', getCaseById);
router.post('/', authorize(UserRole.ADMIN, UserRole.BHW, UserRole.HOSPITAL_ENCODER), createCase);
router.put('/:id', authorize(UserRole.ADMIN, UserRole.BHW, UserRole.HOSPITAL_ENCODER), updateCase);
router.delete('/:id', authorize(UserRole.ADMIN), deleteCase);

export default router;


