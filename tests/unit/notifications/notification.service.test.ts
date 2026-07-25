import { beforeEach, describe, expect, it, vi } from "vitest";
import { Permissions } from "@/modules/permissions/constants/permissions";
import { ApiErrorCode, type AppError } from "@/shared/api/errors";

const mocks = vi.hoisted(() => ({
  requireAppContext: vi.fn(),
  listNotificationsForMember: vi.fn(),
  countUnreadNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  createNotificationRecord: vi.fn(),
}));

vi.mock("@/modules/auth/services/app-context.service", () => ({
  requireAppContext: mocks.requireAppContext,
}));

vi.mock("@/modules/notifications/repository/notification.repository", () => ({
  listNotificationsForMember: mocks.listNotificationsForMember,
  countUnreadNotifications: mocks.countUnreadNotifications,
  markNotificationRead: mocks.markNotificationRead,
  markAllNotificationsRead: mocks.markAllNotificationsRead,
  createNotificationRecord: mocks.createNotificationRecord,
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {},
}));

import {
  getMyUnreadCount,
  listMyNotifications,
  markAllMyNotificationsRead,
  markNotificationAsRead,
} from "@/modules/notifications/services/notification.service";

function memberContext(permissions: string[]) {
  return {
    user: { id: "u1", name: "User", email: "u@x.com", emailVerified: true },
    organization: { id: "org1", name: "Acme", slug: "acme" },
    member: {
      id: "m1",
      organizationId: "org1",
      userId: "u1",
      roleId: "r1",
      roleName: "Member",
      isOwner: false,
    },
    permissions,
  };
}

describe("notification.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAppContext.mockResolvedValue(
      memberContext([
        Permissions.NOTIFICATION_READ,
        Permissions.NOTIFICATION_UPDATE,
      ]),
    );
  });

  it("lists only the current member notifications", async () => {
    mocks.listNotificationsForMember.mockResolvedValue([
      {
        id: "n1",
        organizationId: "org1",
        memberId: "m1",
        type: "LEAD_ASSIGNED",
        title: "Lead assigned",
        message: "You were assigned",
        metadata: { leadId: "lead1" },
        readAt: null,
        createdAt: new Date("2026-07-25T10:00:00.000Z"),
      },
    ]);

    const rows = await listMyNotifications();
    expect(mocks.listNotificationsForMember).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        organizationId: "org1",
        memberId: "m1",
      }),
    );
    expect(rows[0]?.leadId).toBe("lead1");
    expect(rows[0]?.readAt).toBeNull();
  });

  it("returns unread count for current member", async () => {
    mocks.countUnreadNotifications.mockResolvedValue(3);
    await expect(getMyUnreadCount()).resolves.toBe(3);
  });

  it("marks one notification as read", async () => {
    mocks.markNotificationRead.mockResolvedValue({
      id: "n1",
      organizationId: "org1",
      memberId: "m1",
      type: "LEAD_UPDATED",
      title: "Lead status updated",
      message: "Status changed",
      metadata: { leadId: "lead1" },
      readAt: new Date("2026-07-25T11:00:00.000Z"),
      createdAt: new Date("2026-07-25T10:00:00.000Z"),
    });

    const dto = await markNotificationAsRead("n1");
    expect(dto.readAt).toBe("2026-07-25T11:00:00.000Z");
  });

  it("throws not found when mark read misses", async () => {
    mocks.markNotificationRead.mockResolvedValue(null);
    await expect(markNotificationAsRead("missing")).rejects.toMatchObject({
      code: ApiErrorCode.NOT_FOUND,
    } satisfies Partial<AppError>);
  });

  it("marks all unread as read", async () => {
    mocks.markAllNotificationsRead.mockResolvedValue({ count: 2 });
    await expect(markAllMyNotificationsRead()).resolves.toEqual({ count: 2 });
  });
});
