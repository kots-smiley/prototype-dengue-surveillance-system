import express from 'express';
import { getBarangays, getBarangayById, createBarangay, updateBarangay, deleteBarangay } from '../controllers/barangays';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

router.use(authenticate);

router.get('/', getBarangays);
router.get('/:id', getBarangayById);
router.post('/', authorize(UserRole.ADMIN), createBarangay);
router.put('/:id', authorize(UserRole.ADMIN), updateBarangay);
router.delete('/:id', authorize(UserRole.ADMIN), deleteBarangay);

export default router;


