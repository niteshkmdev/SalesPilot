import type { NotificationType, Prisma } from "@prisma/client";

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Prisma.JsonValue | null;
  readAt: string | null;
  createdAt: string;
  leadId: string | null;
}

export interface CreateNotificationInput {
  organizationId: string;
  memberId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Prisma.InputJsonValue;
}
