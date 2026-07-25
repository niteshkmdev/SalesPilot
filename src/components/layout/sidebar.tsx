"use client";

import { ChevronUp, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { SalesPilotBrandLink } from "@/components/brand/salespilot-mark";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import {
  getNavigationForRole,
  getSettingsNavForRole,
  isNavItemActive,
  type NavItem,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: string;
  user: {
    name: string;
    email: string;
    image?: string | null;
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

export function Sidebar({ role, user }: SidebarProps) {
  const pathname = usePathname();
  const items = getNavigationForRole(role);
  const settingsItems = getSettingsNavForRole(role);
  const accountActive = pathname.startsWith("/settings");

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-full flex-col gap-5 px-3 pt-4 pb-3">
        <SalesPilotBrandLink href="/dashboard" className="h-10 shrink-0 px-3" />

        <nav
          aria-label="Main navigation"
          className="flex min-h-0 flex-1 flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <p className="px-3 text-xs font-medium tracking-wide text-sidebar-foreground/50 uppercase">
              Menu
            </p>
            <div className="flex flex-col gap-1">
              {items.map((item) => (
                <SidebarItem
                  key={item.title}
                  item={item}
                  isActive={isNavItemActive(pathname, item.href, items)}
                />
              ))}
            </div>
          </div>

          <div className="mt-auto border-t border-sidebar-border pt-3">
            <AccountMenu
              user={user}
              settingsItems={settingsItems}
              pathname={pathname}
              isActive={accountActive}
            />
          </div>
        </nav>
      </div>
    </aside>
  );
}

function AccountMenu({
  user,
  settingsItems,
  pathname,
  isActive,
}: {
  user: SidebarProps["user"];
  settingsItems: NavItem[];
  pathname: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const initials = getInitials(user.name) || "U";

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
    } catch (_error) {
      toast.error("Error signing out");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-3 rounded-xl bg-sidebar-accent px-3 py-2.5 text-left text-sidebar-accent-foreground transition-colors hover:brightness-[0.98]",
            isActive && "ring-1 ring-sidebar-ring/40",
          )}
        >
          <Avatar className="size-8 shrink-0">
            <AvatarImage src={user.image || ""} alt={user.name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p
              className="truncate text-xs text-sidebar-foreground/60"
              title={user.email}
            >
              {user.email}
            </p>
          </div>
          <ChevronUp className="size-4 shrink-0 text-sidebar-foreground/50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        className="w-64"
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left hover:bg-muted"
            onClick={() => router.push("/settings/profile")}
          >
            <Avatar className="size-9 shrink-0">
              <AvatarImage src={user.image || ""} alt={user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p
                className="truncate text-xs text-muted-foreground"
                title={user.email}
              >
                {user.email}
              </p>
            </div>
          </button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {settingsItems.map((item) => {
          const Icon = item.icon;
          const itemActive = pathname === item.href;
          return (
            <DropdownMenuItem
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(itemActive && "bg-muted font-medium")}
            >
              <Icon />
              {item.title}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex h-10 w-full shrink-0 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
        isActive
          ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{item.title}</span>
    </Link>
  );
}
