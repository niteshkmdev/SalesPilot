import type { User } from "@prisma/client";
import { authService } from "@/modules/auth/services/auth.service";
import {
  findFirstActiveMemberByUserId,
  getPermissionNamesFromMember,
} from "@/modules/organizations/repository/member.repository";
import { provisionOrganizationForUser } from "@/modules/organizations/services/provisioning.service";
import type { OrganizationContext } from "@/modules/organizations/types/OrganizationContext";
import { prisma } from "@/server/db/prisma";

export async function requireAppContext(): Promise<OrganizationContext> {
  const user = (await authService.requireUser()) as User;
  const member = await findFirstActiveMemberByUserId(prisma, user.id);

  if (!member) {
    return provisionOrganizationForUser(user);
  }

  return {
    user,
    organization: member.organization,
    member,
    permissions: getPermissionNamesFromMember(member),
  };
}
