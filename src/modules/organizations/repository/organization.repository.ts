import type { Organization, OrganizationMember, Role } from "@prisma/client";
import type { DatabaseClient } from "@/server/db/types";

export interface CreateOrganizationInput {
  name: string;
  slug: string;
}

export interface CreateRoleInput {
  organizationId: string;
  name: string;
  description?: string;
}

export interface CreateMemberInput {
  organizationId: string;
  userId: string;
  roleId: string;
  isOwner: boolean;
}

export async function findOrganizationBySlug(
  db: DatabaseClient,
  slug: string,
): Promise<Organization | null> {
  return db.organization.findUnique({ where: { slug } });
}

export async function createOrganization(
  db: DatabaseClient,
  input: CreateOrganizationInput,
): Promise<Organization> {
  return db.organization.create({ data: input });
}

export async function createRole(
  db: DatabaseClient,
  input: CreateRoleInput,
): Promise<Role> {
  return db.role.create({ data: input });
}

export async function createMember(
  db: DatabaseClient,
  input: CreateMemberInput,
): Promise<OrganizationMember> {
  return db.organizationMember.create({ data: input });
}

export async function createRolePermissions(
  db: DatabaseClient,
  roleId: string,
  permissionIds: string[],
): Promise<void> {
  await db.rolePermission.createMany({
    data: permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    })),
  });
}

export async function createDefaultLeadStatuses(
  db: DatabaseClient,
  organizationId: string,
  statuses: Array<{
    name: string;
    color: string;
    displayOrder: number;
    isDefault: boolean;
    isClosed: boolean;
    isWon: boolean;
  }>,
): Promise<void> {
  await db.organizationLeadStatus.createMany({
    data: statuses.map((status) => ({ ...status, organizationId })),
  });
}

export async function createDefaultLeadSources(
  db: DatabaseClient,
  organizationId: string,
  sources: Array<{
    name: string;
    displayOrder: number;
    active: boolean;
  }>,
): Promise<void> {
  await db.organizationLeadSource.createMany({
    data: sources.map((source) => ({ ...source, organizationId })),
  });
}

export async function createDefaultBranding(
  db: DatabaseClient,
  organizationId: string,
): Promise<void> {
  await db.branding.create({ data: { organizationId } });
}
