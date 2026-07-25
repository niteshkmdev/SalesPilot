import { describe, expect, it } from "vitest";

import {
  allPermissionNames,
  permissionDefinitions,
} from "@/modules/permissions/constants/permissions";

describe("permissionDefinitions", () => {
  it("keeps permission names unique and action based", () => {
    const uniqueNames = new Set(allPermissionNames);

    expect(uniqueNames.size).toBe(allPermissionNames.length);
    expect(
      allPermissionNames.every((name) => /^[a-z]+\.[a-z]+$/.test(name)),
    ).toBe(true);
  });

  it("provides UI grouping metadata for every permission", () => {
    expect(permissionDefinitions.every(({ group }) => group.length > 0)).toBe(
      true,
    );
    expect(
      permissionDefinitions.every(({ description }) => description.length > 0),
    ).toBe(true);
  });
});
