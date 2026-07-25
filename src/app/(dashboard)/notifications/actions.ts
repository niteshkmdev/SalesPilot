"use server";

import {
  getMyUnreadCount,
  listMyNotifications,
  markAllMyNotificationsRead,
  markNotificationAsRead,
} from "@/modules/notifications";
import { AppError } from "@/shared/api/errors";

function actionError(error: unknown): { error: string } {
  if (error instanceof AppError) {
    return { error: error.message };
  }
  if (error instanceof Error) {
    return { error: error.message };
  }
  return { error: "Something went wrong." };
}

export async function listNotificationsAction() {
  try {
    const notifications = await listMyNotifications({ limit: 50 });
    return { success: true as const, notifications };
  } catch (error) {
    return actionError(error);
  }
}

export async function getUnreadNotificationCountAction() {
  try {
    const count = await getMyUnreadCount();
    return { success: true as const, count };
  } catch (error) {
    return actionError(error);
  }
}

export async function markNotificationReadAction(notificationId: string) {
  try {
    const notification = await markNotificationAsRead(notificationId);
    return { success: true as const, notification };
  } catch (error) {
    return actionError(error);
  }
}

export async function markAllNotificationsReadAction() {
  try {
    const result = await markAllMyNotificationsRead();
    return { success: true as const, count: result.count };
  } catch (error) {
    return actionError(error);
  }
}
