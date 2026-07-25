import { authService } from "@/modules/auth/services/auth.service";
import {
  findFirstActiveMemberByUserId,
  getPermissionNamesFromMember,
} from "@/modules/organizations/repository/member.repository";
import type {
  AppUser,
  OrganizationContext,
} from "@/modules/organizations/types/OrganizationContext";
import { prisma } from "@/server/db/prisma";
import { organizationRequired } from "@/shared/api/errors";

/**
 * Resolves the authenticated, verified user's organization context.
 * Load-only: does not provision organizations (Better Auth user.create hook owns that).
 */
export async function requireAppContext(): Promise<OrganizationContext> {
  const sessionUser = await authService.requireUser();
  const user = toAppUser(sessionUser);
  const member = await findFirstActiveMemberByUserId(prisma, user.id);

  if (!member) {
    throw organizationRequired();
  }

  return {
    user,
    organization: {
      id: member.organization.id,
      name: member.organization.name,
      slug: member.organization.slug,
      logo: member.organization.branding?.logo ?? null,
    },
    member: {
      id: member.id,
      organizationId: member.organizationId,
      userId: member.userId,
      roleId: member.roleId,
      roleName: member.role.name,
      isOwner: member.isOwner,
    },
    permissions: getPermissionNamesFromMember(member),
  };
}

function toAppUser(user: {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
}): AppUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image ?? null,
    emailVerified: user.emailVerified,
  };
}
