import { describe, expect, it } from "vitest";
import {
  getNavigationForRole,
  getSettingsNavForRole,
  isNavItemActive,
  navigationItems,
  settingsNavItems,
} from "@/lib/navigation";

describe("navigation helpers", () => {
  it("returns Dashboard, Leads, and Forms for Owner/Admin/Manager", () => {
    expect(getNavigationForRole("Owner").map((i) => i.title)).toEqual([
      "Dashboard",
      "Leads",
      "Forms",
    ]);
    expect(getNavigationForRole("Admin").map((i) => i.title)).toEqual([
      "Dashboard",
      "Leads",
      "Forms",
    ]);
    expect(getNavigationForRole("Manager").map((i) => i.title)).toEqual([
      "Dashboard",
      "Leads",
      "Forms",
    ]);
    expect(getNavigationForRole("Member").map((i) => i.title)).toEqual([
      "Dashboard",
      "Leads",
    ]);
  });

  it("defaults unknown roles to Member visibility", () => {
    expect(getNavigationForRole("Unknown").map((i) => i.title)).toEqual([
      "Dashboard",
      "Leads",
    ]);
  });

  it("puts Members and Custom Fields in settings nav for Owner/Admin", () => {
    expect(settingsNavItems.map((i) => i.title)).toEqual([
      "Profile",
      "Organization",
      "Members",
      "Custom Fields",
    ]);
    expect(getSettingsNavForRole("Owner").map((i) => i.title)).toEqual([
      "Profile",
      "Organization",
      "Members",
      "Custom Fields",
    ]);
    expect(getSettingsNavForRole("Member").map((i) => i.title)).toEqual([
      "Profile",
    ]);
    expect(navigationItems.some((i) => i.href === "/settings/members")).toBe(
      false,
    );
  });

  it("marks the most specific nav href as active", () => {
    const items = getNavigationForRole("Owner");
    expect(isNavItemActive("/leads/new", "/leads", items)).toBe(true);
    expect(isNavItemActive("/dashboard", "/leads", items)).toBe(false);
  });
});
