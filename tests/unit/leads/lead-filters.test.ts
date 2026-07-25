import { describe, expect, it } from "vitest";
import {
  hasActiveListFilters,
  LeadListFiltersSchema,
} from "@/modules/leads/dto/lead.dto";
import {
  buildListOrderBy,
  buildListWhere,
} from "@/modules/leads/repository/lead.repository";

describe("LeadListFiltersSchema", () => {
  it("applies defaults for pagination and sorting", () => {
    const parsed = LeadListFiltersSchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(25);
    expect(parsed.sort).toBe("updatedAt");
    expect(parsed.order).toBe("desc");
  });

  it("parses boolean duplicate filter from query strings", () => {
    expect(
      LeadListFiltersSchema.parse({ isDuplicate: "true" }).isDuplicate,
    ).toBe(true);
    expect(
      LeadListFiltersSchema.parse({ isDuplicate: "false" }).isDuplicate,
    ).toBe(false);
    expect(
      LeadListFiltersSchema.parse({ isDuplicate: "" }).isDuplicate,
    ).toBeUndefined();
  });
});

describe("buildListWhere", () => {
  it("builds filters for assignees, dates, and duplicate flag", () => {
    const where = buildListWhere({
      q: undefined,
      statusId: "st1",
      sourceId: "src1",
      assignedMemberId: "m1",
      assignedManagerId: "m2",
      createdFrom: "2026-01-01",
      createdTo: "2026-01-31",
      updatedFrom: "2026-02-01",
      updatedTo: "2026-02-28",
      isDuplicate: true,
      page: 1,
      limit: 25,
      sort: "createdAt",
      order: "desc",
    });

    expect(where.statusId).toBe("st1");
    expect(where.sourceId).toBe("src1");
    expect(where.assignedMemberId).toBe("m1");
    expect(where.assignedManagerId).toBe("m2");
    expect(where.isDuplicate).toBe(true);
    expect(where.createdAt).toEqual({
      gte: new Date("2026-01-01T00:00:00.000Z"),
      lte: new Date("2026-01-31T23:59:59.999Z"),
    });
    expect(where.updatedAt).toEqual({
      gte: new Date("2026-02-01T00:00:00.000Z"),
      lte: new Date("2026-02-28T23:59:59.999Z"),
    });
  });

  it("escapes search metacharacters", () => {
    const where = buildListWhere({
      q: "acme.*",
      page: 1,
      limit: 25,
      sort: "createdAt",
      order: "desc",
    });
    expect(where.OR?.[0]).toEqual({
      firstName: { contains: "acme\\.\\*", mode: "insensitive" },
    });
  });
});

describe("buildListOrderBy", () => {
  it("maps sort fields", () => {
    expect(buildListOrderBy("company", "asc")).toEqual({ company: "asc" });
    expect(buildListOrderBy("firstName", "desc")).toEqual({
      firstName: "desc",
    });
  });

  it("uses compound orderBy for updatedAt with createdAt fallback", () => {
    expect(buildListOrderBy("updatedAt", "desc")).toEqual([
      { updatedAt: "desc" },
      { createdAt: "desc" },
    ]);
    expect(buildListOrderBy()).toEqual([
      { updatedAt: "desc" },
      { createdAt: "desc" },
    ]);
  });
});

describe("hasActiveListFilters", () => {
  it("detects active filters", () => {
    expect(
      hasActiveListFilters({
        q: "",
        statusId: undefined,
        sourceId: undefined,
        assignedMemberId: undefined,
        assignedManagerId: undefined,
        createdFrom: undefined,
        createdTo: undefined,
        updatedFrom: undefined,
        updatedTo: undefined,
        isDuplicate: undefined,
      }),
    ).toBe(false);

    expect(
      hasActiveListFilters({
        q: "acme",
        statusId: undefined,
        sourceId: undefined,
        assignedMemberId: undefined,
        assignedManagerId: undefined,
        createdFrom: undefined,
        createdTo: undefined,
        updatedFrom: undefined,
        updatedTo: undefined,
        isDuplicate: undefined,
      }),
    ).toBe(true);
  });
});
