import type { Organization, OrganizationMember, User } from "@prisma/client";
import type { PermissionName } from "@/modules/permissions/constants/permissions";

export interface OrganizationContext {
  user: User;
  organization: Organization;
  member: OrganizationMember;
  permissions: PermissionName[];
}
