import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  type LucideIcon,
  User,
  UsersRound,
} from "lucide-react";

export type Role = "Owner" | "Admin" | "Manager" | "Member";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
}

/**
 * Live navigation only includes routes that exist today.
 * Forms, Branding, and Notifications are deferred until their plans ship.
 * Settings is opened via a sidebar popper (see settingsNavItems), not a top-level link.
 */
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
    icon: ClipboardList,
    roles: ["Owner", "Admin", "Manager", "Member"],
  },
  {
    title: "Members",
    href: "/settings/members",
    icon: UsersRound,
    roles: ["Owner", "Admin"],
  },
];

/** Destinations shown in the Settings sidebar/header popper. */
export const settingsNavItems: NavItem[] = [
  {
    title: "Profile",
    href: "/settings/profile",
    icon: User,
    roles: ["Owner", "Admin", "Manager", "Member"],
  },
  {
    title: "Organization",
    href: "/settings/organization",
    icon: Building2,
    roles: ["Owner", "Admin"],
  },
  {
    title: "Members",
    href: "/settings/members",
    icon: UsersRound,
    roles: ["Owner", "Admin"],
  },
];

const settingsAccessRoles: Role[] = ["Owner", "Admin"];

export function canAccessSettings(role: string): boolean {
  return settingsAccessRoles.includes(
    (["Owner", "Admin", "Manager", "Member"].includes(role)
      ? role
      : "Member") as Role,
  );
}

export function getNavigationForRole(role: string): NavItem[] {
  // If role is undefined or unrecognized, default to Member visibility.
  const matchedRole = (
    ["Owner", "Admin", "Manager", "Member"].includes(role) ? role : "Member"
  ) as Role;
  return navigationItems.filter((item) => item.roles.includes(matchedRole));
}

export function getSettingsNavForRole(role: string): NavItem[] {
  const matchedRole = (
    ["Owner", "Admin", "Manager", "Member"].includes(role) ? role : "Member"
  ) as Role;
  return settingsNavItems.filter((item) => item.roles.includes(matchedRole));
}

/** Prefer the most specific matching nav href (e.g. Members over Settings). */
export function isNavItemActive(
  pathname: string,
  href: string,
  items: NavItem[],
): boolean {
  const matches = pathname === href || pathname.startsWith(`${href}/`);
  if (!matches) return false;

  const hasMoreSpecificMatch = items.some(
    (item) =>
      item.href !== href &&
      item.href.startsWith(`${href}/`) &&
      (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  );

  return !hasMoreSpecificMatch;
}
