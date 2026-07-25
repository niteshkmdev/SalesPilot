import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findPendingInvitationByEmail: vi.fn(),
  findFirstActiveMemberByUserId: vi.fn(),
  createMember: vi.fn(),
  markInvitationAccepted: vi.fn(),
  userUpdate: vi.fn(),
  $transaction: vi.fn(),
}));

vi.mock("@/modules/organizations/repository/invitation.repository", () => ({
  findPendingInvitationByEmail: mocks.findPendingInvitationByEmail,
  findInvitationByToken: vi.fn(),
  findInvitationById: vi.fn(),
  listPendingInvitationsByOrganization: vi.fn(),
  upsertPendingInvitation: vi.fn(),
  deleteInvitation: vi.fn(),
  markInvitationAccepted: mocks.markInvitationAccepted,
}));

vi.mock("@/modules/organizations/repository/member.repository", () => ({
  createMember: mocks.createMember,
  findFirstActiveMemberByUserId: mocks.findFirstActiveMemberByUserId,
  findMemberByUserAndOrg: vi.fn(),
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    $transaction: mocks.$transaction,
    user: { update: mocks.userUpdate, findFirst: vi.fn() },
  },
}));

vi.mock("@/modules/auth/services/app-context.service", () => ({
  requireAppContext: vi.fn(),
}));

vi.mock("@/server/email/mailer", () => ({
  sendEmail: vi.fn(),
}));

vi.mock("@/server/env", () => ({
  env: { BETTER_AUTH_URL: "http://localhost:3000" },
}));

describe("redeemPendingInvitationForNewUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.$transaction.mockImplementation(
      async (callback: (tx: object) => unknown) =>
        callback({
          user: { update: mocks.userUpdate },
        }),
    );
  });

  it("joins the invited org and skips when no invite exists", async () => {
    const { redeemPendingInvitationForNewUser } = await import(
      "@/modules/organizations/services/invitation.service"
    );

    mocks.findPendingInvitationByEmail.mockResolvedValueOnce(null);
    await expect(
      redeemPendingInvitationForNewUser({
        id: "user_1",
        email: "new@example.com",
      }),
    ).resolves.toBe(false);

    mocks.findPendingInvitationByEmail.mockResolvedValueOnce({
      id: "inv_1",
      organizationId: "org_1",
      roleId: "role_member",
      email: "new@example.com",
    });
    mocks.findFirstActiveMemberByUserId.mockResolvedValueOnce(null);
    mocks.createMember.mockResolvedValueOnce({});
    mocks.markInvitationAccepted.mockResolvedValueOnce({});
    mocks.userUpdate.mockResolvedValueOnce({});

    await expect(
      redeemPendingInvitationForNewUser({
        id: "user_1",
        email: "new@example.com",
      }),
    ).resolves.toBe(true);

    expect(mocks.createMember).toHaveBeenCalledWith(expect.anything(), {
      organizationId: "org_1",
      userId: "user_1",
      roleId: "role_member",
      isOwner: false,
    });
    expect(mocks.markInvitationAccepted).toHaveBeenCalled();
    expect(mocks.userUpdate).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { emailVerified: true },
    });
  });
});
