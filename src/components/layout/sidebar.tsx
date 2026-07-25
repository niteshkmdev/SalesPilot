"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavigationForRole, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = getNavigationForRole(role);

  return (
    <div className="hidden border-r bg-muted/40 lg:block lg:w-64 lg:shrink-0 h-[calc(100vh-64px)]">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-4 text-sm font-medium gap-1">
            {items.map((item) => (
              <SidebarItem
                key={item.title}
                item={item}
                isActive={
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                }
              />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive ? "bg-muted text-primary font-semibold" : "",
      )}
    >
      <Icon className="h-4 w-4" />
      {item.title}
    </Link>
  );
}
