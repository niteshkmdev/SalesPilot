import { describe, expect, it } from "vitest";

import { Permissions } from "@/modules/permissions/constants/permissions";
import { createAuthorizationService } from "@/modules/permissions/services/authorization.service";
import { ApiErrorCode } from "@/shared/api/errors";

describe("createAuthorizationService", () => {
  it("checks individual and grouped permissions", async () => {
    const authorization = createAuthorizationService([
      Permissions.LEAD_READ,
      Permissions.LEAD_CREATE,
    ]);

    await expect(authorization.can(Permissions.LEAD_READ)).resolves.toBe(true);
    await expect(authorization.can(Permissions.LEAD_DELETE)).resolves.toBe(
      false,
    );
    await expect(
      authorization.canAll([Permissions.LEAD_READ, Permissions.LEAD_CREATE]),
    ).resolves.toBe(true);
    await expect(
      authorization.canAll([Permissions.LEAD_READ, Permissions.LEAD_DELETE]),
    ).resolves.toBe(false);
    await expect(
      authorization.canAny([Permissions.LEAD_DELETE, Permissions.LEAD_CREATE]),
    ).resolves.toBe(true);
  });

  it("throws a stable permission denied error", async () => {
    const authorization = createAuthorizationService([Permissions.LEAD_READ]);

    await expect(
      authorization.require(Permissions.LEAD_DELETE),
    ).rejects.toEqual(
      expect.objectContaining({
        code: ApiErrorCode.PERMISSION_DENIED,
        status: 403,
      }),
    );
  });
});
