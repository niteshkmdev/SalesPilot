import { beforeEach, describe, expect, it, vi } from "vitest";
import { Permissions } from "@/modules/permissions/constants/permissions";
import { AppError } from "@/shared/api/errors";

const mocks = vi.hoisted(() => ({
  requireAppContext: vi.fn(),
  findMemberById: vi.fn(),
  deleteMember: vi.fn(),
  updateMemberRole: vi.fn(),
  findRoleById: vi.fn(),
  ensureDefaultRoles: vi.fn(),
  syncSystemRolePermissions: vi.fn(),
  listRolesByOrganization: vi.fn(),
  listMembersByOrganization: vi.fn(),
}));

vi.mock("@/modules/auth/services/app-context.service", () => ({
  requireAppContext: mocks.requireAppContext,
}));

vi.mock("@/modules/organizations/repository/member.repository", () => ({
  findMemberById: mocks.findMemberById,
  deleteMember: mocks.deleteMember,
  updateMemberRole: mocks.updateMemberRole,
  listMembersByOrganization: mocks.listMembersByOrganization,
}));

vi.mock("@/modules/organizations/repository/role.repository", () => ({
  findRoleById: mocks.findRoleById,
  listRolesByOrganization: mocks.listRolesByOrganization,
}));

vi.mock("@/modules/organizations/services/role-seed.service", () => ({
  ensureDefaultRoles: mocks.ensureDefaultRoles,
  syncSystemRolePermissions: mocks.syncSystemRolePermissions,
}));

describe("member.service guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAppContext.mockResolvedValue({
      user: { id: "u1", name: "Owner", email: "o@x.com", emailVerified: true },
      organization: { id: "org1", name: "Acme", slug: "acme" },
      member: {
        id: "m1",
        organizationId: "org1",
        userId: "u1",
        roleId: "r-owner",
        roleName: "Owner",
        isOwner: true,
      },
      permissions: Object.values(Permissions),
    });
  });

  it("refuses to remove the organization owner", async () => {
    const { removeMember } = await import(
      "@/modules/organizations/services/member.service"
    );
    mocks.findMemberById.mockResolvedValue({
      id: "m-owner",
      organizationId: "org1",
      isOwner: true,
      role: { name: "Owner" },
    });

    await expect(removeMember("m-owner")).rejects.toBeInstanceOf(AppError);
    expect(mocks.deleteMember).not.toHaveBeenCalled();
  });

  it("refuses to change the owner role", async () => {
    const { changeMemberRole } = await import(
      "@/modules/organizations/services/member.service"
    );
    mocks.findMemberById.mockResolvedValue({
      id: "m-owner",
      organizationId: "org1",
      isOwner: true,
      role: { name: "Owner" },
    });

    await expect(
      changeMemberRole("m-owner", "role-admin"),
    ).rejects.toBeInstanceOf(AppError);
    expect(mocks.updateMemberRole).not.toHaveBeenCalled();
  });
});
