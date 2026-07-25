import {
  Building2,
  ClipboardList,
  FormInput,
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
 * Branding and Notifications remain deferred until their plans ship.
 * Profile, Organization, Members, and Custom Fields open from the account foot.
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
    title: "Forms",
    href: "/forms",
    icon: FormInput,
    roles: ["Owner", "Admin", "Manager"],
  },
];

/** Destinations shown in the sidebar account foot popper. */
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
  {
    title: "Custom Fields",
    href: "/settings/custom-fields",
    icon: FormInput,
    roles: ["Owner", "Admin"],
  },
];

function matchRole(role: string): Role {
  return (
    ["Owner", "Admin", "Manager", "Member"].includes(role) ? role : "Member"
  ) as Role;
}

export function getNavigationForRole(role: string): NavItem[] {
  const matchedRole = matchRole(role);
  return navigationItems.filter((item) => item.roles.includes(matchedRole));
}

export function getSettingsNavForRole(role: string): NavItem[] {
  const matchedRole = matchRole(role);
  return settingsNavItems.filter((item) => item.roles.includes(matchedRole));
}

/** Prefer the most specific matching nav href. */
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
