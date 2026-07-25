import type { Prisma } from "@prisma/client";
import {
  defaultLeadSources,
  defaultLeadStatuses,
  ownerRoleName,
} from "@/modules/organizations/constants/defaults";
import { createMember } from "@/modules/organizations/repository/member.repository";
import {
  createDefaultBranding,
  createDefaultLeadSources,
  createDefaultLeadStatuses,
  createOrganization,
  findOrganizationBySlug,
} from "@/modules/organizations/repository/organization.repository";
import {
  createRole,
  createRolePermissions,
} from "@/modules/organizations/repository/role.repository";
import type {
  AppUser,
  OrganizationContext,
} from "@/modules/organizations/types/OrganizationContext";
import {
  allPermissionNames,
  permissionDefinitions,
} from "@/modules/permissions/constants/permissions";
import {
  findPermissionIdsByNames,
  upsertPermissions,
} from "@/modules/permissions/repository/permission.repository";
import { prisma } from "@/server/db/prisma";

/** Minimal user fields required to provision an organization. */
export type ProvisionableUser = Pick<
  AppUser,
  "id" | "name" | "email" | "image" | "emailVerified"
>;

export async function provisionOrganizationForUser(
  user: ProvisionableUser,
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
      user: toAppUser(user),
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
      member: {
        id: member.id,
        organizationId: member.organizationId,
        userId: member.userId,
        roleId: member.roleId,
        roleName: ownerRole.name,
        isOwner: member.isOwner,
      },
      permissions: allPermissionNames,
    };
  });
}

function toAppUser(user: ProvisionableUser): AppUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    emailVerified: user.emailVerified,
  };
}

function buildOrganizationName(user: ProvisionableUser): string {
  const trimmedName = user.name.trim();
  return trimmedName ? `${trimmedName}'s Organization` : "SalesPilot Workspace";
}

async function buildUniqueOrganizationSlug(
  tx: Prisma.TransactionClient,
  user: ProvisionableUser,
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
