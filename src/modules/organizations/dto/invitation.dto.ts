import { z } from "zod";
import type { InvitationWithRelations } from "@/modules/organizations/repository/invitation.repository";

export const InvitationIdSchema = z.object({
  invitationId: z.string().min(1),
});

export interface InvitationDto {
  id: string;
  organizationId: string;
  organizationName: string;
  email: string;
  roleId: string;
  roleName: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  revokedAt: string | null;
  isExpired: boolean;
  isRevoked: boolean;
  inviterName: string;
}

export interface PublicInvitationDto {
  organizationName: string;
  roleName: string;
  email: string;
  expiresAt: string;
  isExpired: boolean;
  isRevoked: boolean;
  isAccepted: boolean;
}

function isRevokedInvitation(
  invitation: Pick<InvitationWithRelations, "revokedAt">,
): boolean {
  return invitation.revokedAt != null;
}

function isExpiredInvitation(
  invitation: Pick<InvitationWithRelations, "expiresAt" | "revokedAt">,
  now = Date.now(),
): boolean {
  if (isRevokedInvitation(invitation)) return false;
  return invitation.expiresAt.getTime() <= now;
}

export function toInvitationDto(
  invitation: InvitationWithRelations,
): InvitationDto {
  const isRevoked = isRevokedInvitation(invitation);
  return {
    id: invitation.id,
    organizationId: invitation.organizationId,
    organizationName: invitation.organization.name,
    email: invitation.email,
    roleId: invitation.roleId,
    roleName: invitation.role.name,
    token: invitation.token,
    expiresAt: invitation.expiresAt.toISOString(),
    createdAt: invitation.createdAt.toISOString(),
    revokedAt: invitation.revokedAt?.toISOString() ?? null,
    isExpired: isExpiredInvitation(invitation),
    isRevoked,
    inviterName: invitation.creator.user.name,
  };
}

export function toPublicInvitationDto(
  invitation: InvitationWithRelations,
): PublicInvitationDto {
  const now = Date.now();
  const isRevoked = isRevokedInvitation(invitation);
  return {
    organizationName: invitation.organization.name,
    roleName: invitation.role.name,
    email: invitation.email,
    expiresAt: invitation.expiresAt.toISOString(),
    isExpired: !isRevoked && invitation.expiresAt.getTime() <= now,
    isRevoked,
    isAccepted: Boolean(invitation.acceptedAt),
  };
}
