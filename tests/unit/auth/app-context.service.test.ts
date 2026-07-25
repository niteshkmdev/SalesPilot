import type { User } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Permissions } from "@/modules/permissions/constants/permissions";

const mocks = vi.hoisted(() => ({
  user: {
    id: "user_1",
    name: "Ada Lovelace",
    email: "ada@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date("2026-07-25T00:00:00.000Z"),
    updatedAt: new Date("2026-07-25T00:00:00.000Z"),
  } satisfies User,
  requireUser: vi.fn(),
  findFirstActiveMemberByUserId: vi.fn(),
  provisionOrganizationForUser: vi.fn(),
}));

vi.mock("@/modules/auth/services/auth.service", () => ({
  authService: {
    requireUser: mocks.requireUser,
  },
}));

vi.mock("@/modules/organizations/repository/member.repository", () => ({
  findFirstActiveMemberByUserId: mocks.findFirstActiveMemberByUserId,
  getPermissionNamesFromMember: () => [Permissions.LEAD_READ],
}));

vi.mock("@/modules/organizations/services/provisioning.service", () => ({
  provisionOrganizationForUser: mocks.provisionOrganizationForUser,
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {},
}));

describe("requireAppContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue(mocks.user);
  });

  it("resolves context from the first active membership", async () => {
    const member = {
      id: "member_1",
      organizationId: "org_1",
      userId: "user_1",
      roleId: "role_1",
      isOwner: true,
      joinedAt: new Date("2026-07-25T00:00:00.000Z"),
      organization: {
        id: "org_1",
        name: "Acme",
        slug: "acme",
        createdAt: new Date("2026-07-25T00:00:00.000Z"),
        updatedAt: new Date("2026-07-25T00:00:00.000Z"),
      },
      role: {
        id: "role_1",
        organizationId: "org_1",
        name: "Owner",
        description: null,
        createdAt: new Date("2026-07-25T00:00:00.000Z"),
        rolePermissions: [],
      },
    };
    mocks.findFirstActiveMemberByUserId.mockResolvedValue(member);

    const { requireAppContext } = await import(
      "@/modules/auth/services/app-context.service"
    );

    await expect(requireAppContext()).resolves.toEqual({
      user: mocks.user,
      organization: member.organization,
      member,
      permissions: [Permissions.LEAD_READ],
    });
    expect(mocks.provisionOrganizationForUser).not.toHaveBeenCalled();
  });

  it("provisions organization context when the user has no membership", async () => {
    const provisionedContext = {
      user: mocks.user,
      organization: { id: "org_1" },
      member: { id: "member_1" },
      permissions: [Permissions.LEAD_READ],
    };
    mocks.findFirstActiveMemberByUserId.mockResolvedValue(null);
    mocks.provisionOrganizationForUser.mockResolvedValue(provisionedContext);

    const { requireAppContext } = await import(
      "@/modules/auth/services/app-context.service"
    );

    await expect(requireAppContext()).resolves.toBe(provisionedContext);
    expect(mocks.provisionOrganizationForUser).toHaveBeenCalledWith(mocks.user);
  });
});
