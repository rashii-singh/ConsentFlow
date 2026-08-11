import { z } from 'zod';

export const grantConsentSchema = z.object({
  noticeId: z.string().min(1, { message: 'Notice ID is required' }),
  choices: z.record(z.boolean()).refine((val) => Object.keys(val).length > 0, {
    message: 'At least one consent purpose choice must be specified',
  }),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export const revokeConsentSchema = z.object({
  recordId: z.string().min(1, { message: 'Consent Record ID is required' }),
  reason: z.string().optional(),
});

export type GrantConsentInput = z.infer<typeof grantConsentSchema>;
export type RevokeConsentInput = z.infer<typeof revokeConsentSchema>;
