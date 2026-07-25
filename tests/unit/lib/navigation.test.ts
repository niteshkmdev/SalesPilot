import { describe, expect, it } from "vitest";
import {
  getNavigationForRole,
  getSettingsNavForRole,
  isNavItemActive,
  navigationItems,
  settingsNavItems,
} from "@/lib/navigation";

describe("navigation helpers", () => {
  it("returns full main nav for Owner and Admin", () => {
    expect(getNavigationForRole("Owner").map((i) => i.title)).toEqual([
      "Dashboard",
      "Leads",
      "Members",
    ]);
    expect(getNavigationForRole("Admin").map((i) => i.title)).toEqual([
      "Dashboard",
      "Leads",
      "Members",
    ]);
  });

  it("hides Members from Manager and Member main nav", () => {
    expect(getNavigationForRole("Manager").map((i) => i.title)).toEqual([
      "Dashboard",
      "Leads",
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

  it("settings nav is Profile + Organization only (no Members dupe)", () => {
    expect(settingsNavItems.map((i) => i.title)).toEqual([
      "Profile",
      "Organization",
    ]);
    expect(getSettingsNavForRole("Owner").map((i) => i.title)).toEqual([
      "Profile",
      "Organization",
    ]);
    expect(getSettingsNavForRole("Member").map((i) => i.title)).toEqual([
      "Profile",
    ]);
  });

  it("keeps Members as a top-level nav item only", () => {
    expect(navigationItems.some((i) => i.href === "/settings/members")).toBe(
      true,
    );
    expect(settingsNavItems.some((i) => i.href === "/settings/members")).toBe(
      false,
    );
  });

  it("marks the most specific nav href as active", () => {
    const items = getNavigationForRole("Owner");
    expect(
      isNavItemActive("/settings/members", "/settings/members", items),
    ).toBe(true);
    expect(isNavItemActive("/leads/new", "/leads", items)).toBe(true);
    expect(isNavItemActive("/dashboard", "/leads", items)).toBe(false);
  });
});
