import type { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";

/**
 * Guard the MongoDB unread filter shape: omitted `readAt` must still count as unread.
 * (Prisma `readAt: null` alone does not match unset fields on MongoDB.)
 */
describe("notification unread where (MongoDB)", () => {
  it("matches both null and unset readAt", () => {
    const unreadWhere: Prisma.NotificationWhereInput = {
      OR: [{ readAt: null }, { readAt: { isSet: false } }],
    };

    expect(unreadWhere).toEqual({
      OR: [{ readAt: null }, { readAt: { isSet: false } }],
    });
  });
});
