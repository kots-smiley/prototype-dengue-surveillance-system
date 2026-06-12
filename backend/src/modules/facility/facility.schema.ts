import { z } from 'zod';

const facilityTypeEnum = z.enum([
  'RHU_MAIN',
  'BARANGAY_HEALTH_STATION',
  'MUNICIPAL_HOSPITAL',
  'DISTRICT_HOSPITAL',
  'PRIVATE_CLINIC',
  'LABORATORY',
  'PHARMACY',
]);

export const createFacilitySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  type: facilityTypeEnum,
  barangayId: z.string().optional(),
  address: z.string().optional(),
  contactNumber: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateFacilitySchema = createFacilitySchema.partial();

export const listFacilityQuerySchema = z.object({
  type: facilityTypeEnum.optional(),
  barangayId: z.string().optional(),
  isActive: z.string().optional(),
  search: z.string().optional(),
});

export type CreateFacilityInput = z.infer<typeof createFacilitySchema>;
export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>;
export type ListFacilityQuery = z.infer<typeof listFacilityQuerySchema>;
