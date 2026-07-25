import { describe, expect, it } from "vitest";
import {
  getNavigationForRole,
  getSettingsNavForRole,
  isNavItemActive,
  navigationItems,
  settingsNavItems,
} from "@/lib/navigation";

describe("navigation helpers", () => {
  it("returns main nav with Custom Fields before Forms for Owner/Admin", () => {
    expect(getNavigationForRole("Owner").map((i) => i.title)).toEqual([
      "Dashboard",
      "Leads",
      "Custom Fields",
      "Forms",
    ]);
    expect(getNavigationForRole("Admin").map((i) => i.title)).toEqual([
      "Dashboard",
      "Leads",
      "Custom Fields",
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
      "Forms",
    ]);
  });

  it("defaults unknown roles to Member visibility", () => {
    expect(getNavigationForRole("Unknown").map((i) => i.title)).toEqual([
      "Dashboard",
      "Leads",
      "Forms",
    ]);
  });

  it("puts Members in the account foot settings nav for Owner/Admin", () => {
    expect(settingsNavItems.map((i) => i.title)).toEqual([
      "Profile",
      "Organization",
      "Members",
    ]);
    expect(getSettingsNavForRole("Owner").map((i) => i.title)).toEqual([
      "Profile",
      "Organization",
      "Members",
    ]);
    expect(getSettingsNavForRole("Member").map((i) => i.title)).toEqual([
      "Profile",
    ]);
    expect(navigationItems.some((i) => i.href === "/settings/members")).toBe(
      false,
    );
    expect(
      navigationItems.find((i) => i.href === "/settings/custom-fields")?.title,
    ).toBe("Custom Fields");
  });

  it("marks the most specific nav href as active", () => {
    const items = getNavigationForRole("Owner");
    expect(isNavItemActive("/leads/new", "/leads", items)).toBe(true);
    expect(isNavItemActive("/dashboard", "/leads", items)).toBe(false);
  });
});
