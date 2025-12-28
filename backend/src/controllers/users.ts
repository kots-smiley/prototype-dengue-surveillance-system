import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { prisma } from '../utils/prisma';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['ADMIN', 'BHW', 'HOSPITAL_ENCODER', 'RESIDENT']),
  barangayId: z.string().optional(),
  isActive: z.boolean().optional().default(true)
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['ADMIN', 'BHW', 'HOSPITAL_ENCODER', 'RESIDENT']).optional(),
  barangayId: z.string().optional(),
  isActive: z.boolean().optional()
});

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role, barangayId, isActive } = req.query;

    const where: any = {};
    if (role) where.role = role;
    if (barangayId) where.barangayId = barangayId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        barangayId: true,
        isActive: true,
        createdAt: true,
        barangay: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        barangayId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        barangay: true
      }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw createError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        barangayId: data.barangayId || null,
        isActive: data.isActive !== undefined ? data.isActive : true
      } as any,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        barangayId: true,
        isActive: true,
        createdAt: true,
        barangay: true
      }
    });

    res.status(201).json({
      success: true,
      user
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });
      if (existingUser) {
        throw createError('Email already registered', 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        barangayId: data.barangayId || undefined
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        barangayId: true,
        isActive: true,
        updatedAt: true,
        barangay: true
      }
    });

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Soft delete by deactivating
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};


