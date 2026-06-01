import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRepository } from './auth.repository';
import { LoginInput, RegisterInput, ChangePasswordInput } from './auth.schema';
import { getEnv } from '../../configuration/env';
import { AppError } from '../../helper/app-error';

function stripPassword<T extends { password?: string }>(user: T) {
  const { password: _password, ...rest } = user;
  return rest;
}

function signToken(payload: { userId: string; email: string; role: string }): string {
  const { JWT_SECRET, JWT_EXPIRES_IN } = getEnv();
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
}

export const authService = {
  async login(input: LoginInput) {
    const user = await authRepository.findByEmail(input.email);
    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return { token, user: stripPassword(user) };
  },

  async register(input: RegisterInput) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await authRepository.create({
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      ...(input.barangayId
        ? { barangay: { connect: { id: input.barangayId } } }
        : {}),
    });

    return stripPassword(user);
  },

  async getCurrentUser(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  },

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await authRepository.findRawById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const valid = await bcrypt.compare(input.currentPassword, user.password);
    if (!valid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 10);
    await authRepository.updatePassword(userId, hashedPassword);
  },
};
