import { z } from 'zod';
import { GrievanceType, GrievanceStatus, UserRole } from '@prisma/client';

// ============================================================================
// 1. Consent Action Schemas
// ============================================================================

export const grantConsentSchema = z.object({
  noticeId: z.string().min(1, { message: 'Notice ID is required' }),
  choices: z
    .record(z.boolean())
    .refine((val) => Object.keys(val).length > 0, {
      message: 'At least one consent purpose choice must be specified',
    }),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export const revokeConsentSchema = z.object({
  recordId: z.string().min(1, { message: 'Consent Record ID is required' }),
  reason: z.string().max(500, { message: 'Reason must not exceed 500 characters' }).optional(),
});

export type GrantConsentInput = z.infer<typeof grantConsentSchema>;
export type RevokeConsentInput = z.infer<typeof revokeConsentSchema>;

// ============================================================================
// 2. Consent Notice Schemas
// ============================================================================

export const purposeItemSchema = z.object({
  id: z.string().min(1, { message: 'Purpose ID is required' }),
  name: z.string().min(2, { message: 'Purpose name must be at least 2 characters' }),
  description: z.string().optional().default(''),
  required: z.boolean().default(false),
  defaultOn: z.boolean().optional().default(false),
});

export const createNoticeSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters' })
    .max(255, { message: 'Title must not exceed 255 characters' }),
  rawLegalText: z
    .string()
    .min(10, { message: 'Raw legal text must be at least 10 characters' }),
  purposes: z
    .array(purposeItemSchema)
    .min(1, { message: 'At least one data processing purpose is required' }),
});

export type CreateNoticeInput = z.infer<typeof createNoticeSchema>;

// ============================================================================
// 3. Grievance Schemas
// ============================================================================

export const createGrievanceSchema = z.object({
  businessId: z.string().min(1, { message: 'Target Business ID is required' }),
  type: z.nativeEnum(GrievanceType, {
    errorMap: () => ({
      message: 'Grievance type must be one of: ACCESS, ERASURE, CORRECTION, NOMINATION',
    }),
  }),
  subject: z
    .string()
    .min(3, { message: 'Subject must be at least 3 characters' })
    .max(200, { message: 'Subject must not exceed 200 characters' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(5000, { message: 'Description must not exceed 5000 characters' }),
});

export const updateGrievanceSchema = z.object({
  ticketId: z.string().min(1, { message: 'Ticket ID is required' }),
  status: z.nativeEnum(GrievanceStatus, {
    errorMap: () => ({
      message: 'Status must be one of: OPEN, IN_PROGRESS, RESOLVED, ESCALATED',
    }),
  }),
  resolutionNotes: z.string().max(2000).optional(),
  resolution: z.string().max(2000).optional(),
});

export type CreateGrievanceInput = z.infer<typeof createGrievanceSchema>;
export type UpdateGrievanceInput = z.infer<typeof updateGrievanceSchema>;

/**
 * Validates allowed state transitions for grievance tickets.
 */
export function isValidGrievanceTransition(
  currentStatus: GrievanceStatus,
  targetStatus: GrievanceStatus,
  userRole: UserRole
): { valid: boolean; error?: string } {
  if (currentStatus === targetStatus) {
    return { valid: true };
  }

  // Once RESOLVED, only a REGULATOR can reopen or escalate the ticket
  if (currentStatus === GrievanceStatus.RESOLVED) {
    if (userRole !== UserRole.REGULATOR) {
      return {
        valid: false,
        error: 'Resolved grievances cannot be reopened except by a Regulatory Officer.',
      };
    }
  }

  // Valid status transitions:
  // OPEN -> IN_PROGRESS, ESCALATED, RESOLVED
  // IN_PROGRESS -> RESOLVED, ESCALATED
  // ESCALATED -> IN_PROGRESS, RESOLVED
  const allowedTransitions: Record<GrievanceStatus, GrievanceStatus[]> = {
    [GrievanceStatus.OPEN]: [
      GrievanceStatus.IN_PROGRESS,
      GrievanceStatus.ESCALATED,
      GrievanceStatus.RESOLVED,
    ],
    [GrievanceStatus.IN_PROGRESS]: [
      GrievanceStatus.RESOLVED,
      GrievanceStatus.ESCALATED,
    ],
    [GrievanceStatus.ESCALATED]: [
      GrievanceStatus.IN_PROGRESS,
      GrievanceStatus.RESOLVED,
    ],
    [GrievanceStatus.RESOLVED]: [
      GrievanceStatus.IN_PROGRESS,
      GrievanceStatus.ESCALATED,
    ],
  };

  const allowed = allowedTransitions[currentStatus]?.includes(targetStatus);
  if (!allowed) {
    return {
      valid: false,
      error: `Invalid transition from ${currentStatus} to ${targetStatus}.`,
    };
  }

  return { valid: true };
}

// ============================================================================
// 4. Webhook Schemas
// ============================================================================

export const testWebhookSchema = z.object({
  webhookUrl: z
    .string()
    .url({ message: 'Must be a valid HTTP or HTTPS webhook URL' })
    .optional(),
});

export type TestWebhookInput = z.infer<typeof testWebhookSchema>;

// ============================================================================
// 5. AI Simplification Schemas
// ============================================================================

export const simplifyNoticeSchema = z.object({
  text: z
    .string()
    .min(10, { message: 'Notice text must be at least 10 characters long' }),
  lang: z.enum(['en', 'hi', 'kn', 'ta', 'te']).default('en'),
  noticeId: z.string().optional(),
});

export type SimplifyNoticeInput = z.infer<typeof simplifyNoticeSchema>;
