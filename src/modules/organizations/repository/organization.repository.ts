import type { Organization } from "@prisma/client";
import type { DatabaseClient } from "@/server/db/types";

export interface CreateOrganizationInput {
  name: string;
  slug: string;
}

export async function findOrganizationBySlug(
  db: DatabaseClient,
  slug: string,
): Promise<Organization | null> {
  return db.organization.findUnique({ where: { slug } });
}

export async function findOrganizationById(
  db: DatabaseClient,
  organizationId: string,
): Promise<Organization | null> {
  return db.organization.findUnique({ where: { id: organizationId } });
}

export async function createOrganization(
  db: DatabaseClient,
  input: CreateOrganizationInput,
): Promise<Organization> {
  return db.organization.create({ data: input });
}

export async function updateOrganizationName(
  db: DatabaseClient,
  organizationId: string,
  name: string,
): Promise<Organization> {
  return db.organization.update({
    where: { id: organizationId },
    data: { name },
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
