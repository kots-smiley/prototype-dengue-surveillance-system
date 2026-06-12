import { z } from 'zod';

const sexEnum = z.enum(['MALE', 'FEMALE']);
const civilStatusEnum = z.enum(['SINGLE', 'MARRIED', 'WIDOWED', 'SEPARATED', 'OTHER']);

export const createPatientSchema = z.object({
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
  birthDate: z.coerce.date(),
  sex: sexEnum,
  civilStatus: civilStatusEnum.optional(),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  barangayId: z.string().optional(),
  philhealthNo: z.string().optional(),
  bloodType: z.string().optional(),
  consentGiven: z.boolean().optional().default(false),
  notes: z.string().optional(),
});

export const updatePatientSchema = createPatientSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const listPatientQuerySchema = z.object({
  search: z.string().optional(),
  barangayId: z.string().optional(),
  isActive: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type ListPatientQuery = z.infer<typeof listPatientQuerySchema>;
