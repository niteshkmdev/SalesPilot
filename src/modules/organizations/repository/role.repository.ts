import type { Role } from "@prisma/client";
import type { DatabaseClient } from "@/server/db/types";

export interface CreateRoleInput {
  organizationId: string;
  name: string;
  description?: string;
}

export async function createRole(
  db: DatabaseClient,
  input: CreateRoleInput,
): Promise<Role> {
  return db.role.create({ data: input });
}

export async function createRolePermissions(
  db: DatabaseClient,
  roleId: string,
  permissionIds: string[],
): Promise<void> {
  if (permissionIds.length === 0) return;
  await db.rolePermission.createMany({
    data: permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    })),
  });
}

export async function findRoleById(
  db: DatabaseClient,
  roleId: string,
): Promise<Role | null> {
  return db.role.findUnique({ where: { id: roleId } });
}

export async function findRoleByName(
  db: DatabaseClient,
  organizationId: string,
  name: string,
): Promise<Role | null> {
  return db.role.findUnique({
    where: {
      organizationId_name: { organizationId, name },
    },
  });
}

export async function listRolesByOrganization(
  db: DatabaseClient,
  organizationId: string,
): Promise<Role[]> {
  return db.role.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}
