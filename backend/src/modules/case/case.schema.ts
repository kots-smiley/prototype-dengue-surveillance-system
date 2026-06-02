import { z } from 'zod';

const statusEnum = z.enum(['SUSPECTED', 'PROBABLE', 'CONFIRMED']);
const outcomeEnum = z.enum(['ONGOING', 'RECOVERED', 'DIED']);
const sourceEnum = z.enum(['PUBLIC_HOSPITAL', 'PRIVATE_HOSPITAL', 'RHU', 'BHW']);
const sexEnum = z.enum(['MALE', 'FEMALE']);

export const createCaseSchema = z.object({
  diseaseId: z.string().min(1),
  barangayId: z.string().min(1),
  dateReported: z.coerce.date(),
  onsetDate: z.coerce.date().optional(),
  age: z.number().int().min(0).max(120).optional().default(0),
  ageGroup: z.string().optional().default('N/A'),
  sex: sexEnum.optional(),
  status: statusEnum,
  outcome: outcomeEnum.optional().default('ONGOING'),
  source: sourceEnum,
  notes: z.string().optional(),
});

export const updateCaseSchema = z.object({
  diseaseId: z.string().min(1).optional(),
  barangayId: z.string().min(1).optional(),
  dateReported: z.coerce.date().optional(),
  onsetDate: z.coerce.date().optional(),
  age: z.number().int().min(0).max(120).optional(),
  ageGroup: z.string().optional(),
  sex: sexEnum.optional(),
  status: statusEnum.optional(),
  outcome: outcomeEnum.optional(),
  source: sourceEnum.optional(),
  notes: z.string().optional(),
});

export const listCaseQuerySchema = z.object({
  diseaseId: z.string().optional(),
  barangayId: z.string().optional(),
  status: statusEnum.optional(),
  source: sourceEnum.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
export type ListCaseQuery = z.infer<typeof listCaseQuerySchema>;
