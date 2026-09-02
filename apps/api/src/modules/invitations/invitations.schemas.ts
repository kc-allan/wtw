import { InvitationChannel } from '@wtw/shared';
import { z } from 'zod';

export const issueInvitationSchema = z.object({
  guestIds: z.array(z.string().min(1)).min(1).max(500),
  channel: z.nativeEnum(InvitationChannel).default(InvitationChannel.WHATSAPP),
  /** Re-mint the token, invalidating any link already shared. */
  regenerate: z.boolean().default(false),
});

export const sendInvitationSchema = z.object({
  guestIds: z.array(z.string().min(1)).min(1).max(500),
  channel: z.nativeEnum(InvitationChannel).default(InvitationChannel.WHATSAPP),
});

export type IssueInvitationInput = z.infer<typeof issueInvitationSchema>;
export type SendInvitationInput = z.infer<typeof sendInvitationSchema>;
