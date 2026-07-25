import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultNonOwnerRoles } from "@/modules/organizations/constants/default-roles";

const mocks = vi.hoisted(() => ({
  upsertPermissions: vi.fn(),
  findPermissionIdsByNames: vi.fn(),
  findRoleByName: vi.fn(),
  createRole: vi.fn(),
  createRolePermissions: vi.fn(),
  rolePermissionDeleteMany: vi.fn(),
  roleUpdate: vi.fn(),
  rolePermissionUpsert: vi.fn(),
}));

vi.mock("@/modules/permissions/repository/permission.repository", () => ({
  upsertPermissions: mocks.upsertPermissions,
  findPermissionIdsByNames: mocks.findPermissionIdsByNames,
}));

vi.mock("@/modules/organizations/repository/role.repository", () => ({
  findRoleByName: mocks.findRoleByName,
  createRole: mocks.createRole,
  createRolePermissions: mocks.createRolePermissions,
}));

describe("ensureDefaultRoles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findPermissionIdsByNames.mockResolvedValue(["p1"]);
    mocks.createRole.mockImplementation(
      async (_db: unknown, input: { name: string }) => ({
        id: `role_${input.name}`,
        organizationId: "org_1",
        name: input.name,
        description: null,
        createdAt: new Date(),
      }),
    );
  });

  it("creates missing non-owner roles and skips existing ones", async () => {
    const { ensureDefaultRoles } = await import(
      "@/modules/organizations/services/role-seed.service"
    );

    mocks.findRoleByName.mockImplementation(
      async (_db: unknown, _orgId: string, name: string) => {
        if (name === "Admin") {
          return {
            id: "role_Admin",
            organizationId: "org_1",
            name: "Admin",
            description: null,
            createdAt: new Date(),
          };
        }
        return null;
      },
    );

    const roles = await ensureDefaultRoles(
      {} as import("@/server/db/types").DatabaseClient,
      "org_1",
    );

    expect(roles).toHaveLength(defaultNonOwnerRoles.length);
    expect(mocks.createRole).toHaveBeenCalledTimes(2);
    expect(mocks.createRolePermissions).toHaveBeenCalledTimes(2);
  });

  it("syncSystemRolePermissions upserts desired permissions and prunes extras", async () => {
    const { syncSystemRolePermissions } = await import(
      "@/modules/organizations/services/role-seed.service"
    );

    mocks.findRoleByName.mockImplementation(
      async (_db: unknown, _orgId: string, name: string) => ({
        id: `role_${name}`,
        organizationId: "org_1",
        name,
        description: null,
        createdAt: new Date(),
      }),
    );
    mocks.findPermissionIdsByNames.mockResolvedValue(["p1", "p2", "p1"]);

    const db = {
      rolePermission: {
        deleteMany: mocks.rolePermissionDeleteMany,
        upsert: mocks.rolePermissionUpsert,
      },
      role: {
        update: mocks.roleUpdate,
      },
    } as unknown as import("@/server/db/types").DatabaseClient;

    await syncSystemRolePermissions(db, "org_1");

    expect(mocks.rolePermissionUpsert).toHaveBeenCalled();
    expect(mocks.createRolePermissions).not.toHaveBeenCalled();
    expect(mocks.rolePermissionDeleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          permissionId: { notIn: ["p1", "p2"] },
        }),
      }),
    );
  });
});
