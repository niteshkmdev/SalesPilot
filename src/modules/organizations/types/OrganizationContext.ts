import type { PermissionName } from "@/modules/permissions/constants/permissions";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
}

export interface AppOrganization {
  id: string;
  name: string;
  slug: string;
}

export interface AppMember {
  id: string;
  organizationId: string;
  userId: string;
  roleId: string;
  roleName: string;
  isOwner: boolean;
}

export interface OrganizationContext {
  user: AppUser;
  organization: AppOrganization;
  member: AppMember;
  permissions: PermissionName[];
}
