import { requireAppContext } from "@/modules/auth/services/app-context.service";
import type {
  CreateNotificationInput,
  NotificationDto,
} from "@/modules/notifications/dto/notification.dto";
import {
  countUnreadNotifications,
  createNotificationRecord,
  listNotificationsForMember,
  markAllNotificationsRead as markAllReadRecords,
  markNotificationRead as markReadRecord,
  type NotificationRecord,
} from "@/modules/notifications/repository/notification.repository";
import { Permissions } from "@/modules/permissions/constants/permissions";
import { createAuthorizationService } from "@/modules/permissions/services/authorization.service";
import { prisma } from "@/server/db/prisma";
import type { DatabaseClient } from "@/server/db/types";
import { notFound } from "@/shared/api/errors";

function leadIdFromMetadata(
  metadata: NotificationRecord["metadata"],
): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  const leadId = (metadata as Record<string, unknown>).leadId;
  return typeof leadId === "string" ? leadId : null;
}

export function toNotificationDto(row: NotificationRecord): NotificationDto {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    metadata: row.metadata,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    leadId: leadIdFromMetadata(row.metadata),
  };
}

/** Internal create — used by lead side-effects only. */
export async function createNotification(
  db: DatabaseClient,
  data: CreateNotificationInput,
) {
  return createNotificationRecord(db, data);
}

export async function listMyNotifications(options?: {
  page?: number;
  limit?: number;
}): Promise<NotificationDto[]> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.NOTIFICATION_READ,
  );

  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const skip = (page - 1) * limit;

  const rows = await listNotificationsForMember(prisma, {
    organizationId: ctx.organization.id,
    memberId: ctx.member.id,
    skip,
    take: limit,
  });

  return rows.map(toNotificationDto);
}

export async function getMyUnreadCount(): Promise<number> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.NOTIFICATION_READ,
  );

  return countUnreadNotifications(prisma, ctx.organization.id, ctx.member.id);
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<NotificationDto> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.NOTIFICATION_UPDATE,
  );

  const updated = await markReadRecord(prisma, {
    organizationId: ctx.organization.id,
    memberId: ctx.member.id,
    notificationId,
  });
  if (!updated) {
    throw notFound("Notification not found.");
  }
  return toNotificationDto(updated);
}

export async function markAllMyNotificationsRead(): Promise<{ count: number }> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.NOTIFICATION_UPDATE,
  );

  const result = await markAllReadRecords(
    prisma,
    ctx.organization.id,
    ctx.member.id,
  );
  return { count: result.count };
}
