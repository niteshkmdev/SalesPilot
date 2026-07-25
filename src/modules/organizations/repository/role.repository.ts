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
  await db.rolePermission.createMany({
    data: permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    })),
  });
}
