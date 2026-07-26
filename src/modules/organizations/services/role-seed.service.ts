import type { Role } from "@prisma/client";
import {
  defaultNonOwnerRoles,
  systemRoleNames,
} from "@/modules/organizations/constants/default-roles";
import { ownerRoleName } from "@/modules/organizations/constants/defaults";
import {
  createRole,
  createRolePermissions,
  findRoleByName,
} from "@/modules/organizations/repository/role.repository";
import {
  allPermissionNames,
  permissionDefinitions,
} from "@/modules/permissions/constants/permissions";
import {
  findPermissionIdsByNames,
  upsertPermissions,
} from "@/modules/permissions/repository/permission.repository";
import type { DatabaseClient } from "@/server/db/types";

/**
 * Ensures Admin, Manager, and Member roles exist with documented permission sets.
 * Idempotent: skips roles that already exist by name.
 * Does not create Owner (provisioning owns that).
 * Prefer `syncSystemRolePermissions` when repairing existing orgs.
 */
export async function ensureDefaultRoles(
  db: DatabaseClient,
  organizationId: string,
  options?: { skipPermissionSync?: boolean },
): Promise<Role[]> {
  if (!options?.skipPermissionSync) {
    await upsertPermissions(db, permissionDefinitions);
  }

  const roles: Role[] = [];

  for (const definition of defaultNonOwnerRoles) {
    const existing = await findRoleByName(db, organizationId, definition.name);
    if (existing) {
      roles.push(existing);
      continue;
    }

    const role = await createRole(db, {
      organizationId,
      name: definition.name,
      description: definition.description,
    });

    const permissionIds = await findPermissionIdsByNames(
      db,
      definition.permissions,
    );
    await createRolePermissions(db, role.id, permissionIds);
    roles.push(role);
  }

  return roles;
}

/** Ensures Owner has all permissions (used when repairing older orgs). */
export async function ensureOwnerRolePermissions(
  db: DatabaseClient,
  organizationId: string,
): Promise<Role | null> {
  const owner = await findRoleByName(db, organizationId, ownerRoleName);
  if (!owner) return null;

  await upsertPermissions(db, permissionDefinitions);
  const permissionIds = await findPermissionIdsByNames(db, allPermissionNames);

  for (const permissionId of permissionIds) {
    await db.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: owner.id,
          permissionId,
        },
      },
      create: { roleId: owner.id, permissionId },
      update: {},
    });
  }

  return owner;
}

async function replaceRolePermissions(
  db: DatabaseClient,
  roleId: string,
  permissionIds: string[],
): Promise<void> {
  const uniqueIds = [...new Set(permissionIds)];

  for (const permissionId of uniqueIds) {
    await db.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
      create: { roleId, permissionId },
      update: {},
    });
  }

  await db.rolePermission.deleteMany({
    where: {
      roleId,
      ...(uniqueIds.length > 0 ? { permissionId: { notIn: uniqueIds } } : {}),
    },
  });
}

/**
 * Creates missing system roles and reconciles Admin/Manager/Member/Owner
 * permission sets to the current defaults. Safe to run repeatedly.
 */
export async function syncSystemRolePermissions(
  db: DatabaseClient,
  organizationId: string,
): Promise<void> {
  await upsertPermissions(db, permissionDefinitions);
  await ensureDefaultRoles(db, organizationId);
  await ensureOwnerRolePermissions(db, organizationId);

  for (const definition of defaultNonOwnerRoles) {
    const role = await findRoleByName(db, organizationId, definition.name);
    if (!role) continue;

    const permissionIds = await findPermissionIdsByNames(
      db,
      definition.permissions,
    );
    await replaceRolePermissions(db, role.id, permissionIds);

    if (definition.description) {
      await db.role.update({
        where: { id: role.id },
        data: { description: definition.description },
      });
    }
  }
}

export { systemRoleNames };
