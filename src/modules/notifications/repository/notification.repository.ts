import type { Prisma } from "@prisma/client";
import type { CreateNotificationInput } from "@/modules/notifications/dto/notification.dto";
import type { DatabaseClient } from "@/server/db/types";

/** MongoDB: omitted optional fields are unset, not null — match both for unread. */
const unreadWhere: Prisma.NotificationWhereInput = {
  OR: [{ readAt: null }, { readAt: { isSet: false } }],
};

export async function createNotificationRecord(
  db: DatabaseClient,
  data: CreateNotificationInput,
) {
  return db.notification.create({
    data: {
      organizationId: data.organizationId,
      memberId: data.memberId,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata,
      readAt: null,
    },
  });
}

export async function listNotificationsForMember(
  db: DatabaseClient,
  options: {
    organizationId: string;
    memberId: string;
    skip?: number;
    take?: number;
  },
) {
  return db.notification.findMany({
    where: {
      organizationId: options.organizationId,
      memberId: options.memberId,
    },
    orderBy: [{ readAt: "asc" }, { createdAt: "desc" }],
    skip: options.skip,
    take: options.take ?? 20,
  });
}

export async function countUnreadNotifications(
  db: DatabaseClient,
  organizationId: string,
  memberId: string,
) {
  return db.notification.count({
    where: {
      organizationId,
      memberId,
      ...unreadWhere,
    },
  });
}

export async function markNotificationRead(
  db: DatabaseClient,
  options: {
    organizationId: string;
    memberId: string;
    notificationId: string;
  },
) {
  const existing = await db.notification.findFirst({
    where: {
      id: options.notificationId,
      organizationId: options.organizationId,
      memberId: options.memberId,
    },
  });
  if (!existing) return null;
  if (existing.readAt) return existing;

  return db.notification.update({
    where: { id: existing.id },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(
  db: DatabaseClient,
  organizationId: string,
  memberId: string,
) {
  return db.notification.updateMany({
    where: {
      organizationId,
      memberId,
      ...unreadWhere,
    },
    data: { readAt: new Date() },
  });
}

export type NotificationRecord = Prisma.NotificationGetPayload<object>;
