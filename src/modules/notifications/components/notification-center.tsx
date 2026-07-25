"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/(dashboard)/notifications/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { NotificationDto } from "@/modules/notifications";

const LIST_POLL_MS = 15_000;
const NOTIFICATIONS_URL = "/api/v1/notifications";

async function fetchNotifications(): Promise<NotificationDto[]> {
  const response = await fetch(NOTIFICATIONS_URL, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { notifications?: NotificationDto[] };
    error?: { message?: string };
  };

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message ?? "Failed to load notifications.");
  }

  return payload.data?.notifications ?? [];
}

export function NotificationCenter() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: fetchNotifications,
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: LIST_POLL_MS,
    refetchOnWindowFocus: true,
  });

  const markOne = useMutation({
    mutationFn: async (id: string) => {
      const result = await markNotificationReadAction(id);
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result.notification;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAll = useMutation({
    mutationFn: async () => {
      const result = await markAllNotificationsReadAction();
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result.count;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = listQuery.data ?? [];
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const onOpen = async (item: NotificationDto) => {
    if (!item.readAt) {
      try {
        await markOne.mutateAsync(item.id);
      } catch {
        // Still navigate even if mark-read fails.
      }
    }
    if (item.leadId) {
      router.push(`/leads/${item.leadId}`);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Inbox</CardTitle>
          <CardDescription>
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You're all caught up."}
          </CardDescription>
        </div>
        {unreadCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            {markAll.isPending ? "Marking..." : "Mark all as read"}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {listQuery.isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="text-destructive">
              {listQuery.error instanceof Error
                ? listQuery.error.message
                : "Unable to load notifications."}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => listQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : listQuery.isLoading ? (
          <div className="flex flex-col gap-3">
            {["sk-1", "sk-2", "sk-3", "sk-4"].map((key) => (
              <div
                key={key}
                className="h-16 animate-pulse rounded-lg border bg-muted/40"
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No new notifications.</p>
        ) : (
          <ul className="flex flex-col">
            {notifications.map((item, index) => {
              const created = new Date(item.createdAt);
              const unread = !item.readAt;
              const body = (
                <div className="flex flex-col gap-1 text-left">
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        unread ? "font-semibold" : "font-medium",
                      )}
                    >
                      {item.title}
                    </p>
                    {unread ? (
                      <span
                        className="mt-1 size-2 shrink-0 rounded-full bg-primary"
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.message}
                  </p>
                  <time
                    dateTime={item.createdAt}
                    title={format(created, "PPpp")}
                    className="text-xs text-muted-foreground"
                  >
                    {formatDistanceToNow(created, { addSuffix: true })}
                  </time>
                </div>
              );

              return (
                <li
                  key={item.id}
                  className={cn(
                    index < notifications.length - 1 ? "border-b" : "",
                    unread ? "bg-muted/20" : undefined,
                  )}
                >
                  {item.leadId ? (
                    <button
                      type="button"
                      className="w-full py-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => onOpen(item)}
                    >
                      {body}
                    </button>
                  ) : (
                    <div className="py-3">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
