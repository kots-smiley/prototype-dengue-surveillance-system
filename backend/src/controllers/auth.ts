import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { getEnv } from '../utils/env';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.enum(['ADMIN', 'BHW', 'HOSPITAL_ENCODER', 'RESIDENT']),
    barangayId: z.string().optional()
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { email },
            include: { barangay: true }
        });

        if (!user || !user.isActive) {
            throw createError('Invalid credentials', 401);
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw createError('Invalid credentials', 401);
        }

        const { JWT_SECRET, JWT_EXPIRES_IN } = getEnv();
        const expiresIn: string = JWT_EXPIRES_IN || '7d';
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET as string,
            { expiresIn } as jwt.SignOptions
        );

        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            token,
            user: userWithoutPassword
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

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = registerSchema.parse(req.body);

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
                barangayId: data.barangayId || null
            } as any,
            include: { barangay: true }
        });

        const { password: _, ...userWithoutPassword } = user;

        res.status(201).json({
            success: true,
            user: userWithoutPassword
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

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
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

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { currentPassword, newPassword } = z.object({
            currentPassword: z.string().min(6),
            newPassword: z.string().min(6)
        }).parse(req.body);

        const user = await prisma.user.findUnique({
            where: { id: req.user!.id }
        });

        if (!user) {
            throw createError('User not found', 404);
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            throw createError('Current password is incorrect', 400);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: req.user!.id },
            data: { password: hashedPassword }
        });

        res.json({
            success: true,
            message: 'Password updated successfully'
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


