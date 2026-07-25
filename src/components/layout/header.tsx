"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "@/modules/notifications/components/notification-bell";
import { MobileNav } from "./mobile-nav";

interface HeaderProps {
  role: string;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  organization: {
    name: string;
    logo?: string | null;
  };
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Header({ role, user, organization }: HeaderProps) {
  const orgInitials = getInitials(organization.name) || "OR";
  const workspaceLabel = `${role} workspace`;

  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        <MobileNav role={role} user={user} />

        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-9">
            {organization.logo ? (
              <AvatarImage src={organization.logo} alt={organization.name} />
            ) : null}
            <AvatarFallback>{orgInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 hidden sm:block">
            <p className="truncate text-sm font-medium">{organization.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {workspaceLabel}
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
