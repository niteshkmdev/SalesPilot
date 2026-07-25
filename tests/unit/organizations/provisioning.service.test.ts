import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProvisionableUser } from "@/modules/organizations/services/provisioning.service";
import { allPermissionNames } from "@/modules/permissions/constants/permissions";

const mocks = vi.hoisted(() => ({
  tx: {},
  upsertPermissions: vi.fn(),
  findPermissionIdsByNames: vi.fn(),
  findOrganizationBySlug: vi.fn(),
  createOrganization: vi.fn(),
  createRole: vi.fn(),
  createRolePermissions: vi.fn(),
  createMember: vi.fn(),
  createDefaultLeadStatuses: vi.fn(),
  createDefaultLeadSources: vi.fn(),
  createDefaultBranding: vi.fn(),
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    $transaction: (callback: (tx: object) => unknown) => callback(mocks.tx),
  },
}));

vi.mock("@/modules/permissions/repository/permission.repository", () => ({
  upsertPermissions: mocks.upsertPermissions,
  findPermissionIdsByNames: mocks.findPermissionIdsByNames,
}));

vi.mock("@/modules/organizations/repository/organization.repository", () => ({
  findOrganizationBySlug: mocks.findOrganizationBySlug,
  createOrganization: mocks.createOrganization,
  createDefaultLeadStatuses: mocks.createDefaultLeadStatuses,
  createDefaultLeadSources: mocks.createDefaultLeadSources,
  createDefaultBranding: mocks.createDefaultBranding,
}));

vi.mock("@/modules/organizations/repository/role.repository", () => ({
  createRole: mocks.createRole,
  createRolePermissions: mocks.createRolePermissions,
}));

vi.mock("@/modules/organizations/services/role-seed.service", () => ({
  ensureDefaultRoles: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/modules/organizations/repository/member.repository", () => ({
  createMember: mocks.createMember,
}));

vi.mock("@/modules/organizations/services/role-seed.service", () => ({
  ensureDefaultRoles: vi.fn().mockResolvedValue([]),
}));

describe("provisionOrganizationForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.findOrganizationBySlug.mockResolvedValue(null);
    mocks.createOrganization.mockResolvedValue({
      id: "org_1",
      name: "Ada Lovelace's Organization",
      slug: "ada-lovelace",
      createdAt: new Date("2026-07-25T00:00:00.000Z"),
      updatedAt: new Date("2026-07-25T00:00:00.000Z"),
    });
    mocks.createRole.mockResolvedValue({
      id: "role_1",
      organizationId: "org_1",
      name: "Owner",
      description: "Organization owner with full access.",
      createdAt: new Date("2026-07-25T00:00:00.000Z"),
    });
    mocks.findPermissionIdsByNames.mockResolvedValue(["permission_1"]);
    mocks.createMember.mockResolvedValue({
      id: "member_1",
      organizationId: "org_1",
      userId: "user_1",
      roleId: "role_1",
      isOwner: true,
      joinedAt: new Date("2026-07-25T00:00:00.000Z"),
    });
  });

  it("creates owner-scoped organization defaults in one transaction", async () => {
    const { provisionOrganizationForUser } = await import(
      "@/modules/organizations/services/provisioning.service"
    );
    const user = {
      id: "user_1",
      name: "Ada Lovelace",
      email: "ada@example.com",
      emailVerified: true,
      image: null,
    } satisfies ProvisionableUser;

    const context = await provisionOrganizationForUser(user);

    expect(mocks.createOrganization).toHaveBeenCalledWith(mocks.tx, {
      name: "Ada Lovelace's Organization",
      slug: "ada-lovelace-s-organization",
    });
    expect(mocks.createRole).toHaveBeenCalledWith(mocks.tx, {
      organizationId: "org_1",
      name: "Owner",
      description: "Organization owner with full access.",
    });
    expect(mocks.createRolePermissions).toHaveBeenCalledWith(
      mocks.tx,
      "role_1",
      ["permission_1"],
    );
    expect(mocks.createMember).toHaveBeenCalledWith(mocks.tx, {
      organizationId: "org_1",
      userId: "user_1",
      roleId: "role_1",
      isOwner: true,
    });
    expect(mocks.createDefaultLeadStatuses).toHaveBeenCalledWith(
      mocks.tx,
      "org_1",
      expect.any(Array),
    );
    expect(mocks.createDefaultLeadSources).toHaveBeenCalledWith(
      mocks.tx,
      "org_1",
      expect.any(Array),
    );
    expect(mocks.createDefaultBranding).toHaveBeenCalledWith(mocks.tx, "org_1");
    expect(context.permissions).toEqual(allPermissionNames);
    expect(context.member.roleName).toBe("Owner");
    expect(context.user).toEqual(user);
    expect(context.organization).toEqual({
      id: "org_1",
      name: "Ada Lovelace's Organization",
      slug: "ada-lovelace",
      logo: null,
    });
  });

  it("uses an explicit organization name when provided", async () => {
    const { provisionOrganizationForUser } = await import(
      "@/modules/organizations/services/provisioning.service"
    );
    mocks.createOrganization.mockResolvedValue({
      id: "org_2",
      name: "Acme Inc",
      slug: "acme-inc",
      createdAt: new Date("2026-07-25T00:00:00.000Z"),
      updatedAt: new Date("2026-07-25T00:00:00.000Z"),
    });

    const user = {
      id: "user_1",
      name: "Ada Lovelace",
      email: "ada@example.com",
      emailVerified: true,
      image: null,
    } satisfies ProvisionableUser;

    await provisionOrganizationForUser(user, {
      organizationName: "Acme Inc",
    });

    expect(mocks.createOrganization).toHaveBeenCalledWith(mocks.tx, {
      name: "Acme Inc",
      slug: "acme-inc",
    });
  });
});
