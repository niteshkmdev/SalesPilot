import { describe, expect, it } from "vitest";
import {
  assignableRoleNames,
  defaultNonOwnerRoles,
  systemRoleNames,
} from "@/modules/organizations/constants/default-roles";
import { allPermissionNames } from "@/modules/permissions/constants/permissions";

describe("default roles", () => {
  it("exposes Admin, Manager, and Member as assignable", () => {
    expect([...assignableRoleNames]).toEqual([
      systemRoleNames.admin,
      systemRoleNames.manager,
      systemRoleNames.member,
    ]);
    expect(assignableRoleNames).not.toContain(systemRoleNames.owner);
  });

  it("gives Admin all permissions", () => {
    const admin = defaultNonOwnerRoles.find(
      (role) => role.name === systemRoleNames.admin,
    );
    expect(admin?.permissions).toEqual(allPermissionNames);
  });

  it("keeps Manager and Member narrower than Admin", () => {
    const manager = defaultNonOwnerRoles.find(
      (role) => role.name === systemRoleNames.manager,
    );
    const member = defaultNonOwnerRoles.find(
      (role) => role.name === systemRoleNames.member,
    );

    expect(manager?.permissions.length).toBeGreaterThan(0);
    expect(member?.permissions.length).toBeGreaterThan(0);
    expect(manager?.permissions.length).toBeLessThan(allPermissionNames.length);
    expect(member?.permissions.length).toBeLessThan(
      manager?.permissions.length ?? 0,
    );
    expect(manager?.permissions).toContain("customfield.read");
    expect(member?.permissions).toContain("customfield.read");
    expect(member?.permissions).not.toContain("customfield.manage");
    expect(manager?.permissions).not.toContain("customfield.manage");
  });
});
