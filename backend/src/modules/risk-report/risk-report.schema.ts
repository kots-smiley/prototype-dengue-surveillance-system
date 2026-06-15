import { z } from 'zod';
import { RISK_FACTORS_BY_CATEGORY } from '../../configuration/constants';

const categoryEnum = z.enum(['VECTOR_BORNE', 'WATER_BORNE', 'AIRBORNE']);
const statusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

const factorFields = {
  stagnantWater: z.boolean().optional().default(false),
  poorWasteDisposal: z.boolean().optional().default(false),
  cloggedDrainage: z.boolean().optional().default(false),
  housingCongestion: z.boolean().optional().default(false),
  unsafeWaterSource: z.boolean().optional().default(false),
  poorSanitation: z.boolean().optional().default(false),
  openDefecation: z.boolean().optional().default(false),
  foodContamination: z.boolean().optional().default(false),
  overcrowding: z.boolean().optional().default(false),
  poorVentilation: z.boolean().optional().default(false),
  activeRespiratoryCase: z.boolean().optional().default(false),
};

export const createRiskReportSchema = z.object({
  barangayId: z.string().min(1),
  category: categoryEnum,
  dateReported: z.coerce.date().optional(),
  ...factorFields,
  photoUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
});

export const updateRiskReportSchema = z.object({
  barangayId: z.string().min(1).optional(),
  category: categoryEnum.optional(),
  dateReported: z.coerce.date().optional(),
  stagnantWater: z.boolean().optional(),
  poorWasteDisposal: z.boolean().optional(),
  cloggedDrainage: z.boolean().optional(),
  housingCongestion: z.boolean().optional(),
  unsafeWaterSource: z.boolean().optional(),
  poorSanitation: z.boolean().optional(),
  openDefecation: z.boolean().optional(),
  foodContamination: z.boolean().optional(),
  overcrowding: z.boolean().optional(),
  poorVentilation: z.boolean().optional(),
  activeRespiratoryCase: z.boolean().optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
});

export const listRiskReportQuerySchema = z.object({
  barangayId: z.string().optional(),
  category: categoryEnum.optional(),
  status: statusEnum.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const reviewRiskReportSchema = z.object({
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
});

export const submitPublicReportSchema = z
  .object({
    barangayId: z.string().min(1),
    category: categoryEnum,
    ...factorFields,
    notes: z.string().optional(),
    submittedByName: z.string().optional(),
    submittedByContact: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const factors = RISK_FACTORS_BY_CATEGORY[data.category] ?? [];
    const hasFactor = factors.some((key) => data[key as keyof typeof data] === true);
    if (!hasFactor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select at least one risk factor for the chosen category.',
      });
    }
  });

export type CreateRiskReportInput = z.infer<typeof createRiskReportSchema>;
export type UpdateRiskReportInput = z.infer<typeof updateRiskReportSchema>;
export type ListRiskReportQuery = z.infer<typeof listRiskReportQuerySchema>;
export type ReviewRiskReportInput = z.infer<typeof reviewRiskReportSchema>;
export type SubmitPublicReportInput = z.infer<typeof submitPublicReportSchema>;
