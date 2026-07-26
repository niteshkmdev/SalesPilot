import type { PermissionName } from "@/modules/permissions/constants/permissions";
import type { DatabaseClient } from "@/server/db/types";

export interface PermissionSeedInput {
  name: PermissionName;
  description: string;
  group: string;
}

export async function upsertPermissions(
  db: DatabaseClient,
  permissions: PermissionSeedInput[],
): Promise<void> {
  await Promise.all(
    permissions.map((permission) =>
      db.permission.upsert({
        where: { name: permission.name },
        create: permission,
        update: {
          description: permission.description,
          group: permission.group,
        },
      })
    )
  );
}

export async function findPermissionIdsByNames(
  db: DatabaseClient,
  names: PermissionName[],
): Promise<string[]> {
  const permissions = await db.permission.findMany({
    where: { name: { in: [...names] } },
    select: { id: true },
  });

  return permissions.map(({ id }) => id);
}
