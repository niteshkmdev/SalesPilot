"use client";

import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import {
  getNavigationForRole,
  getSettingsNavForRole,
  isNavItemActive,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface MobileNavProps {
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

export function MobileNav({ role, user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const items = getNavigationForRole(role);
  const settingsItems = getSettingsNavForRole(role);
  const initials = getInitials(user.name) || "U";

  // Close sheet when route changes
  useEffect(() => {
    setOpen((wasOpen) => (pathname && wasOpen ? false : wasOpen));
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      setOpen(false);
      router.push("/login");
    } catch (_error) {
      toast.error("Error signing out");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Access links to different parts of the application.
        </SheetDescription>

        <Link
          href="/dashboard"
          className="mb-6 flex items-center gap-2 text-lg font-semibold"
          onClick={() => setOpen(false)}
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm">
            S
          </span>
          <span>SalesPilot</span>
        </Link>

        <nav className="grid flex-1 content-start gap-1 text-sm font-medium">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = isNavItemActive(pathname, item.href, items);
            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground",
                  isActive && "bg-muted text-foreground font-medium",
                )}
              >
                <Icon className="size-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t pt-4">
          <div className="mb-3 flex items-center gap-3 px-1">
            <Avatar className="size-9 shrink-0">
              <AvatarImage src={user.image || ""} alt={user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p
                className="truncate text-xs text-muted-foreground"
                title={user.email}
              >
                {user.email}
              </p>
            </div>
          </div>

          <div className="grid gap-1 text-sm font-medium">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground",
                    isActive && "bg-muted text-foreground font-medium",
                  )}
                >
                  <Icon className="size-4" />
                  {item.title}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
