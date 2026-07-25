"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/leads/new">
              <PlusIcon data-icon="inline-start" />
              New Lead
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
