import { describe, expect, it } from "vitest";
import { notDeletedWhere } from "@/modules/leads/repository/lead.repository";

describe("notDeletedWhere", () => {
  it("matches explicit null and unset deletedAt for MongoDB", () => {
    expect(notDeletedWhere()).toEqual({
      OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
    });
  });
});
