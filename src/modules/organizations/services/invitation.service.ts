import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { OnboardingState } from "@/modules/auth/constants/onboarding-state";
import { requireAppContext } from "@/modules/auth/services/app-context.service";
import {
  assignableRoleNames,
  INVITATION_EXPIRY_DAYS,
  systemRoleNames,
} from "@/modules/organizations/constants/default-roles";
import {
  type InvitationDto,
  type PublicInvitationDto,
  toInvitationDto,
  toPublicInvitationDto,
} from "@/modules/organizations/dto/invitation.dto";
import { InviteMemberSchema } from "@/modules/organizations/dto/member.dto";
import {
  deleteInvitation as deleteInvitationRecord,
  findInvitationById,
  findInvitationByToken,
  findPendingInvitationByEmail,
  listPendingInvitationsByOrganization,
  markInvitationAccepted,
  markInvitationRevoked,
  refreshInvitation,
  upsertPendingInvitation,
} from "@/modules/organizations/repository/invitation.repository";
import {
  createMember,
  findFirstActiveMemberByUserId,
  findMemberByUserAndOrg,
} from "@/modules/organizations/repository/member.repository";
import { findRoleById } from "@/modules/organizations/repository/role.repository";
import { ensureDefaultRoles } from "@/modules/organizations/services/role-seed.service";
import { Permissions } from "@/modules/permissions/constants/permissions";
import { createAuthorizationService } from "@/modules/permissions/services/authorization.service";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { sendEmail } from "@/server/email/mailer";
import { env } from "@/server/env";
import {
  authenticationRequired,
  conflict,
  notFound,
  permissionDenied,
  validationFailed,
} from "@/shared/api/errors";

function inviteExpiryDate(): Date {
  return new Date(Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
}

function createInviteToken(): string {
  return randomBytes(32).toString("hex");
}

function inviteUrl(token: string): string {
  return `${env.BETTER_AUTH_URL.replace(/\/$/, "")}/invite/${token}`;
}

function isInvitationRevoked(invitation: { revokedAt: Date | null }): boolean {
  return invitation.revokedAt != null;
}

function isInvitationExpired(invitation: {
  expiresAt: Date;
  revokedAt: Date | null;
}): boolean {
  if (isInvitationRevoked(invitation)) return false;
  return invitation.expiresAt.getTime() <= Date.now();
}

function canHardDeleteInvitation(invitation: {
  expiresAt: Date;
  revokedAt: Date | null;
}): boolean {
  return (
    isInvitationRevoked(invitation) ||
    invitation.expiresAt.getTime() <= Date.now()
  );
}

export async function listPendingInvitations(): Promise<InvitationDto[]> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.MEMBER_READ,
  );

  const invitations = await listPendingInvitationsByOrganization(
    prisma,
    ctx.organization.id,
  );
  return invitations.map(toInvitationDto);
}

export async function inviteMember(input: {
  email: string;
  roleId: string;
}): Promise<{ invitation: InvitationDto; emailSent: boolean }> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.MEMBER_INVITE,
  );

  const parsed = InviteMemberSchema.parse(input);
  await ensureDefaultRoles(prisma, ctx.organization.id);

  const role = await findRoleById(prisma, parsed.roleId);
  if (!role || role.organizationId !== ctx.organization.id) {
    throw notFound("Role not found.");
  }
  if (
    !(assignableRoleNames as readonly string[]).includes(role.name) ||
    role.name === systemRoleNames.owner
  ) {
    throw validationFailed("You can only invite Admin, Manager, or Member.");
  }

  const existingMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId: ctx.organization.id,
      user: { email: parsed.email },
    },
  });
  if (existingMember) {
    throw conflict("This user is already a member of the organization.");
  }

  const token = createInviteToken();
  const expiresAt = inviteExpiryDate();

  const invitation = await upsertPendingInvitation(prisma, {
    organizationId: ctx.organization.id,
    email: parsed.email,
    roleId: role.id,
    token,
    expiresAt,
    createdBy: ctx.member.id,
  });

  const withRelations = await findInvitationById(prisma, invitation.id);
  if (!withRelations) {
    throw notFound("Invitation not found after create.");
  }

  const emailSent = await sendInviteEmail({
    to: parsed.email,
    organizationName: ctx.organization.name,
    inviterName: ctx.user.name,
    roleName: role.name,
    token,
    expiresAt,
  });

  return { invitation: toInvitationDto(withRelations), emailSent };
}

export async function resendInvitation(
  invitationId: string,
): Promise<{ invitation: InvitationDto; emailSent: boolean }> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.MEMBER_INVITE,
  );

  const invitation = await findInvitationById(prisma, invitationId);
  if (!invitation || invitation.organizationId !== ctx.organization.id) {
    throw notFound("Invitation not found.");
  }
  if (invitation.acceptedAt) {
    throw conflict("This invitation was already accepted.");
  }

  const token = createInviteToken();
  const expiresAt = inviteExpiryDate();
  await refreshInvitation(prisma, invitationId, { token, expiresAt });

  const refreshed = await findInvitationById(prisma, invitationId);
  if (!refreshed) {
    throw notFound("Invitation not found.");
  }

  const emailSent = await sendInviteEmail({
    to: refreshed.email,
    organizationName: refreshed.organization.name,
    inviterName: ctx.user.name,
    roleName: refreshed.role.name,
    token,
    expiresAt,
  });

  return { invitation: toInvitationDto(refreshed), emailSent };
}

export async function revokeInvitation(invitationId: string): Promise<void> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.MEMBER_INVITE,
  );

  const invitation = await findInvitationById(prisma, invitationId);
  if (!invitation || invitation.organizationId !== ctx.organization.id) {
    throw notFound("Invitation not found.");
  }
  if (invitation.acceptedAt) {
    throw conflict("This invitation was already accepted.");
  }
  if (isInvitationRevoked(invitation)) {
    throw conflict("This invitation is already revoked.");
  }

  await markInvitationRevoked(prisma, invitationId);
}

export async function deleteInvitation(invitationId: string): Promise<void> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.MEMBER_INVITE,
  );

  const invitation = await findInvitationById(prisma, invitationId);
  if (!invitation || invitation.organizationId !== ctx.organization.id) {
    throw notFound("Invitation not found.");
  }
  if (invitation.acceptedAt) {
    throw conflict("This invitation was already accepted.");
  }
  if (!canHardDeleteInvitation(invitation)) {
    throw validationFailed(
      "Revoke the invitation before deleting it, or wait until it expires.",
    );
  }

  await deleteInvitationRecord(prisma, invitationId);
}

export async function getPublicInvitation(
  token: string,
): Promise<PublicInvitationDto | null> {
  const invitation = await findInvitationByToken(prisma, token);
  if (!invitation) return null;
  return toPublicInvitationDto(invitation);
}

/**
 * Redeem a pending invite for a newly created user (auth hook path).
 * Returns true when membership was created from an invite.
 */
export async function redeemPendingInvitationForNewUser(user: {
  id: string;
  email: string;
  name?: string;
}): Promise<boolean> {
  const invitation = await findPendingInvitationByEmail(prisma, user.email);
  if (!invitation) return false;

  const existing = await findFirstActiveMemberByUserId(prisma, user.id);
  if (existing) return false;

  await prisma.$transaction(async (tx) => {
    await createMember(tx, {
      organizationId: invitation.organizationId,
      userId: user.id,
      roleId: invitation.roleId,
      isOwner: false,
    });
    await markInvitationAccepted(tx, invitation.id);
    await tx.user.update({
      where: { id: user.id },
      // Invited users skip the onboarding wizard — mark as COMPLETED.
      // Email is considered verified through the invitation link.
      data: { emailVerified: true, onboardingState: OnboardingState.COMPLETED },
    });
  });

  return true;
}

/**
 * Accept invite for the signed-in user whose email matches the invitation.
 */
export async function acceptInvitationForCurrentUser(
  token: string,
): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw authenticationRequired();

  const user = session.user;
  const invitation = await findInvitationByToken(prisma, token);
  if (!invitation) {
    throw notFound("Invitation not found.");
  }
  if (invitation.acceptedAt) {
    throw conflict("This invitation was already accepted.");
  }
  if (isInvitationRevoked(invitation)) {
    throw validationFailed("This invitation has been revoked.");
  }
  if (isInvitationExpired(invitation)) {
    throw validationFailed("This invitation has expired.");
  }

  const normalizedUserEmail = user.email.trim().toLowerCase();
  if (normalizedUserEmail !== invitation.email.trim().toLowerCase()) {
    throw permissionDenied();
  }

  const existingMembership = await findFirstActiveMemberByUserId(
    prisma,
    user.id,
  );
  if (existingMembership) {
    if (existingMembership.organizationId === invitation.organizationId) {
      await markInvitationAccepted(prisma, invitation.id);
      return;
    }
    throw conflict("You already belong to another organization.");
  }

  const alreadyInOrg = await findMemberByUserAndOrg(
    prisma,
    invitation.organizationId,
    user.id,
  );
  if (alreadyInOrg) {
    await markInvitationAccepted(prisma, invitation.id);
    return;
  }

  await prisma.$transaction(async (tx) => {
    await createMember(tx, {
      organizationId: invitation.organizationId,
      userId: user.id,
      roleId: invitation.roleId,
      isOwner: false,
    });
    await markInvitationAccepted(tx, invitation.id);
    await tx.user.update({
      where: { id: user.id },
      // Invited users skip the onboarding wizard — mark as COMPLETED.
      // Email is considered verified through the invitation link.
      data: { emailVerified: true, onboardingState: OnboardingState.COMPLETED },
    });
  });
}

async function sendInviteEmail(params: {
  to: string;
  organizationName: string;
  inviterName: string;
  roleName: string;
  token: string;
  expiresAt: Date;
}): Promise<boolean> {
  const url = inviteUrl(params.token);
  const expiresLabel = params.expiresAt.toUTCString();
  const html = `
<!DOCTYPE html>
<html lang="en">
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background:#f9fafb; padding:40px 20px;">
  <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #e5e7eb;">
    <h1 style="font-size:22px;margin:0 0 16px;">Join ${escapeHtml(params.organizationName)} on SalesPilot</h1>
    <p style="color:#4b5563;line-height:1.5;">
      ${escapeHtml(params.inviterName)} invited you as <strong>${escapeHtml(params.roleName)}</strong>.
    </p>
    <p style="margin:28px 0;">
      <a href="${url}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        Accept invitation
      </a>
    </p>
    <p style="color:#9ca3af;font-size:13px;">This invitation expires on ${escapeHtml(expiresLabel)}.</p>
  </div>
</body>
</html>`.trim();

  try {
    await sendEmail({
      to: params.to,
      subject: `You're invited to ${params.organizationName} on SalesPilot`,
      html,
      text: `Join ${params.organizationName} as ${params.roleName}: ${url}`,
    });
    return true;
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
