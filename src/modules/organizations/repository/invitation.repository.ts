import type { Invitation, Prisma } from "@prisma/client";
import type { DatabaseClient } from "@/server/db/types";

export interface CreateInvitationInput {
  organizationId: string;
  email: string;
  roleId: string;
  token: string;
  expiresAt: Date;
  createdBy: string;
}

const invitationInclude = {
  role: { select: { id: true, name: true } },
  organization: { select: { id: true, name: true, slug: true } },
  creator: {
    select: {
      id: true,
      user: { select: { name: true, email: true } },
    },
  },
} satisfies Prisma.InvitationInclude;

export type InvitationWithRelations = Prisma.InvitationGetPayload<{
  include: typeof invitationInclude;
}>;

/** MongoDB: optional unset fields do not match `field: null` alone. */
function notAcceptedWhere(): Prisma.InvitationWhereInput {
  return {
    OR: [{ acceptedAt: null }, { acceptedAt: { isSet: false } }],
  };
}

function notRevokedWhere(): Prisma.InvitationWhereInput {
  return {
    OR: [{ revokedAt: null }, { revokedAt: { isSet: false } }],
  };
}

export async function createInvitation(
  db: DatabaseClient,
  input: CreateInvitationInput,
): Promise<Invitation> {
  return db.invitation.create({ data: input });
}

export async function findInvitationByToken(
  db: DatabaseClient,
  token: string,
): Promise<InvitationWithRelations | null> {
  return db.invitation.findUnique({
    where: { token },
    include: invitationInclude,
  });
}

/**
 * Active redeemable invite: not accepted, not revoked, not expired.
 */
export async function findPendingInvitationByEmail(
  db: DatabaseClient,
  email: string,
): Promise<InvitationWithRelations | null> {
  const normalized = email.trim().toLowerCase();
  return db.invitation.findFirst({
    where: {
      email: normalized,
      expiresAt: { gt: new Date() },
      AND: [notAcceptedWhere(), notRevokedWhere()],
    },
    include: invitationInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function findPendingInvitationByOrgAndEmail(
  db: DatabaseClient,
  organizationId: string,
  email: string,
): Promise<Invitation | null> {
  const normalized = email.trim().toLowerCase();
  return db.invitation.findUnique({
    where: {
      organizationId_email: { organizationId, email: normalized },
    },
  });
}

/**
 * Open invitations for the members UI (not accepted), including expired/revoked.
 */
export async function listPendingInvitationsByOrganization(
  db: DatabaseClient,
  organizationId: string,
): Promise<InvitationWithRelations[]> {
  return db.invitation.findMany({
    where: {
      organizationId,
      AND: [notAcceptedWhere()],
    },
    include: invitationInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function findInvitationById(
  db: DatabaseClient,
  invitationId: string,
): Promise<InvitationWithRelations | null> {
  return db.invitation.findUnique({
    where: { id: invitationId },
    include: invitationInclude,
  });
}

export async function markInvitationAccepted(
  db: DatabaseClient,
  invitationId: string,
): Promise<Invitation> {
  return db.invitation.update({
    where: { id: invitationId },
    data: { acceptedAt: new Date() },
  });
}

export async function markInvitationRevoked(
  db: DatabaseClient,
  invitationId: string,
): Promise<Invitation> {
  return db.invitation.update({
    where: { id: invitationId },
    data: { revokedAt: new Date() },
  });
}

export async function refreshInvitation(
  db: DatabaseClient,
  invitationId: string,
  data: { token: string; expiresAt: Date },
): Promise<Invitation> {
  return db.invitation.update({
    where: { id: invitationId },
    data: {
      token: data.token,
      expiresAt: data.expiresAt,
      revokedAt: null,
      acceptedAt: null,
    },
  });
}

export async function deleteInvitation(
  db: DatabaseClient,
  invitationId: string,
): Promise<void> {
  await db.invitation.delete({ where: { id: invitationId } });
}

export async function upsertPendingInvitation(
  db: DatabaseClient,
  input: CreateInvitationInput,
): Promise<Invitation> {
  return db.invitation.upsert({
    where: {
      organizationId_email: {
        organizationId: input.organizationId,
        email: input.email,
      },
    },
    create: {
      ...input,
      acceptedAt: null,
      revokedAt: null,
    },
    update: {
      roleId: input.roleId,
      token: input.token,
      expiresAt: input.expiresAt,
      createdBy: input.createdBy,
      acceptedAt: null,
      revokedAt: null,
    },
  });
}
