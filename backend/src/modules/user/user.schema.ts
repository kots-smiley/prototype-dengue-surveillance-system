import { z } from 'zod';

const roleEnum = z.enum(['ADMIN', 'BHW', 'HOSPITAL_ENCODER', 'RESIDENT']);

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: roleEnum,
  barangayId: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: roleEnum.optional(),
  barangayId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const listUserQuerySchema = z.object({
  role: roleEnum.optional(),
  barangayId: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUserQuery = z.infer<typeof listUserQuerySchema>;
