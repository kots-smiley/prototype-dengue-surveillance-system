import express from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/users';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Only admins can manage users
router.get('/', authorize(UserRole.ADMIN), getUsers);
router.get('/:id', authorize(UserRole.ADMIN), getUserById);
router.post('/', authorize(UserRole.ADMIN), createUser);
router.put('/:id', authorize(UserRole.ADMIN), updateUser);
router.delete('/:id', authorize(UserRole.ADMIN), deleteUser);

export default router;


