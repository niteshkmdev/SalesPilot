import {
  Bell,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  Palette,
  Settings,
  Users,
  UsersRound,
} from "lucide-react";

export type Role = "Owner" | "Admin" | "Manager" | "Member";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
}

export const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["Owner", "Admin", "Manager", "Member"],
  },
  {
    title: "Leads",
    href: "/leads",
    icon: Users,
    roles: ["Owner", "Admin", "Manager", "Member"],
  },
  {
    title: "Forms",
    href: "/forms",
    icon: FileText,
    roles: ["Owner", "Admin", "Manager"],
  },
  {
    title: "Members",
    href: "/members",
    icon: UsersRound,
    roles: ["Owner", "Admin"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["Owner", "Admin"],
  },
  {
    title: "Branding",
    href: "/branding",
    icon: Palette,
    roles: ["Owner", "Admin"],
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    roles: ["Owner", "Admin", "Manager", "Member"],
  },
];

export function getNavigationForRole(role: string): NavItem[] {
  // If role is undefined or unrecognized, default to Member visibility.
  const matchedRole = (
    ["Owner", "Admin", "Manager", "Member"].includes(role) ? role : "Member"
  ) as Role;
  return navigationItems.filter((item) => item.roles.includes(matchedRole));
}
