import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { userRepository } from './user.repository';
import { CreateUserInput, UpdateUserInput, ListUserQuery } from './user.schema';
import { AppError } from '../../helper/app-error';

export const userService = {
  list(query: ListUserQuery) {
    const where: Prisma.UserWhereInput = {};
    if (query.role) where.role = query.role;
    if (query.barangayId) where.barangayId = query.barangayId;
    if (query.facilityId) where.facilityId = query.facilityId;
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';
    return userRepository.findMany(where);
  },

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  },

  async create(input: CreateUserInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    return userRepository.create({
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      licenseNo: input.licenseNo,
      providerType: input.providerType,
      isActive: input.isActive ?? true,
      ...(input.barangayId ? { barangay: { connect: { id: input.barangayId } } } : {}),
      ...(input.facilityId ? { facility: { connect: { id: input.facilityId } } } : {}),
    });
  },

  async update(id: string, input: UpdateUserInput) {
    const user = await userRepository.findRawById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (input.email && input.email !== user.email) {
      const clash = await userRepository.findByEmail(input.email);
      if (clash) {
        throw new AppError('Email already registered', 400);
      }
    }

    const { barangayId, facilityId, ...rest } = input;
    const data: Prisma.UserUpdateInput = { ...rest };
    if (barangayId !== undefined) {
      data.barangay = barangayId ? { connect: { id: barangayId } } : { disconnect: true };
    }
    if (facilityId !== undefined) {
      data.facility = facilityId ? { connect: { id: facilityId } } : { disconnect: true };
    }

    return userRepository.update(id, data);
  },

  async deactivate(id: string) {
    const user = await userRepository.findRawById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return userRepository.update(id, { isActive: false });
  },
};
