import type { Organization } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { toOrganizationDto } from "@/modules/organizations/dto/organization.dto";

describe("toOrganizationDto", () => {
  it("serializes dates and exposes DTO fields only", () => {
    const organization: Organization = {
      id: "org_1",
      name: "Acme",
      slug: "acme",
      createdAt: new Date("2026-07-25T00:00:00.000Z"),
      updatedAt: new Date("2026-07-25T01:00:00.000Z"),
    };

    expect(toOrganizationDto(organization)).toEqual({
      id: "org_1",
      name: "Acme",
      slug: "acme",
      createdAt: "2026-07-25T00:00:00.000Z",
      updatedAt: "2026-07-25T01:00:00.000Z",
    });
  });
});
