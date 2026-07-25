import type { Organization, OrganizationMember } from "@prisma/client";

export interface OrganizationDto {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMemberDto {
  id: string;
  organizationId: string;
  userId: string;
  roleId: string;
  isOwner: boolean;
  joinedAt: string;
}

export function toOrganizationDto(organization: Organization): OrganizationDto {
  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    createdAt: organization.createdAt.toISOString(),
    updatedAt: organization.updatedAt.toISOString(),
  };
}

export function toOrganizationMemberDto(
  member: OrganizationMember,
): OrganizationMemberDto {
  return {
    id: member.id,
    organizationId: member.organizationId,
    userId: member.userId,
    roleId: member.roleId,
    isOwner: member.isOwner,
    joinedAt: member.joinedAt.toISOString(),
  };
}
