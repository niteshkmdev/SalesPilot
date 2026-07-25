import type { Prisma, User } from "@prisma/client";
import {
  defaultLeadSources,
  defaultLeadStatuses,
  ownerRoleName,
} from "@/modules/organizations/constants/defaults";
import {
  createDefaultBranding,
  createDefaultLeadSources,
  createDefaultLeadStatuses,
  createMember,
  createOrganization,
  createRole,
  createRolePermissions,
  findOrganizationBySlug,
} from "@/modules/organizations/repository/organization.repository";
import type { OrganizationContext } from "@/modules/organizations/types/OrganizationContext";
import {
  allPermissionNames,
  permissionDefinitions,
} from "@/modules/permissions/constants/permissions";
import {
  findPermissionIdsByNames,
  upsertPermissions,
} from "@/modules/permissions/repository/permission.repository";
import { prisma } from "@/server/db/prisma";

export async function provisionOrganizationForUser(
  user: User,
): Promise<OrganizationContext> {
  return prisma.$transaction(async (tx) => {
    await upsertPermissions(tx, permissionDefinitions);

    const organization = await createOrganization(tx, {
      name: buildOrganizationName(user),
      slug: await buildUniqueOrganizationSlug(tx, user),
    });

    const ownerRole = await createRole(tx, {
      organizationId: organization.id,
      name: ownerRoleName,
      description: "Organization owner with full access.",
    });

    const permissionIds = await findPermissionIdsByNames(
      tx,
      allPermissionNames,
    );
    await createRolePermissions(tx, ownerRole.id, permissionIds);

    const member = await createMember(tx, {
      organizationId: organization.id,
      userId: user.id,
      roleId: ownerRole.id,
      isOwner: true,
    });

    await createDefaultLeadStatuses(tx, organization.id, defaultLeadStatuses);
    await createDefaultLeadSources(tx, organization.id, defaultLeadSources);
    await createDefaultBranding(tx, organization.id);

    return {
      user,
      organization,
      member,
      permissions: allPermissionNames,
    };
  });
}

function buildOrganizationName(user: User): string {
  const trimmedName = user.name.trim();
  return trimmedName ? `${trimmedName}'s Organization` : "SalesPilot Workspace";
}

async function buildUniqueOrganizationSlug(
  tx: Prisma.TransactionClient,
  user: User,
): Promise<string> {
  const baseSlug = slugify(
    user.name || user.email.split("@")[0] || "workspace",
  );
  let slug = baseSlug;
  let suffix = 1;

  while (await findOrganizationBySlug(tx, slug)) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "workspace";
}
