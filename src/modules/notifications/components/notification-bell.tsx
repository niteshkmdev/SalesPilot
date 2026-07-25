"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BellIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const NOTIFICATIONS_UNREAD_QUERY_KEY = [
  "notifications",
  "unread-count",
] as const;

const UNREAD_POLL_MS = 30_000;
const UNREAD_COUNT_URL = "/api/v1/notifications/unread-count";

async function fetchUnreadCount(): Promise<number> {
  const response = await fetch(UNREAD_COUNT_URL, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { count?: number };
    error?: { message?: string };
  };

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message ?? "Failed to load unread count.");
  }

  return payload.data?.count ?? 0;
}

export function NotificationBell() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY,
    queryFn: fetchUnreadCount,
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: UNREAD_POLL_MS,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Guaranteed first fetch as soon as the bell mounts in the dashboard shell.
  useEffect(() => {
    void queryClient.fetchQuery({
      queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY,
      queryFn: fetchUnreadCount,
      staleTime: 0,
    });
  }, [queryClient]);

  const count = query.data ?? 0;
  const badgeLabel = count > 9 ? "9+" : count > 0 ? String(count) : undefined;

  return (
    <Button
      asChild
      variant="ghost"
      size="icon-lg"
      className="relative shrink-0"
      aria-label={
        count > 0 ? `Notifications, ${count} unread` : "Notifications"
      }
    >
      <Link href="/notifications" className="relative">
        <BellIcon className="size-5 stroke-[1.75]" aria-hidden />
        {badgeLabel ? (
          <span
            className={cn(
              "absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full",
              "border-2 border-background bg-destructive px-0.5",
              "text-[10px] leading-none font-semibold text-white tabular-nums",
            )}
            aria-hidden
          >
            {badgeLabel}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
