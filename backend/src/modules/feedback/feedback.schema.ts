import { z } from 'zod';

export const createFeedbackThreadSchema = z.object({
  subject: z.string().trim().min(1, 'Subject is required').max(200),
  body: z.string().trim().min(1, 'Message is required').max(5000),
  barangayId: z.string().optional(),
});

export const replyFeedbackThreadSchema = z.object({
  body: z.string().trim().min(1, 'Message is required').max(5000),
});

export const listFeedbackQuerySchema = z.object({
  barangayId: z.string().optional(),
  status: z.enum(['OPEN', 'CLOSED']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateFeedbackThreadInput = z.infer<typeof createFeedbackThreadSchema>;
export type ReplyFeedbackThreadInput = z.infer<typeof replyFeedbackThreadSchema>;
export type ListFeedbackQuery = z.infer<typeof listFeedbackQuerySchema>;
