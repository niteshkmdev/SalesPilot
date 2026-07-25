import { describe, expect, it } from "vitest";
import {
  assertValidDateRange,
  DateRangePreset,
  previousEqualLengthRange,
  resolveDateRange,
} from "@/shared/dates";

describe("resolveDateRange", () => {
  // Local noon 15 Jul 2026 (Wednesday) — avoids UTC offset flipping the calendar day.
  const now = new Date(2026, 6, 15, 12, 0, 0);

  it("resolves this month", () => {
    const range = resolveDateRange(DateRangePreset.THIS_MONTH, null, null, now);
    expect(range.preset).toBe(DateRangePreset.THIS_MONTH);
    expect(range.startDate).toBe("2026-07-01");
    expect(range.endDate).toBe("2026-07-31");
  });

  it("resolves this week Monday-Sunday", () => {
    const range = resolveDateRange(DateRangePreset.THIS_WEEK, null, null, now);
    expect(range.startDate).toBe("2026-07-13");
    expect(range.endDate).toBe("2026-07-19");
  });

  it("resolves this year", () => {
    const range = resolveDateRange(DateRangePreset.THIS_YEAR, null, null, now);
    expect(range.startDate).toBe("2026-01-01");
    expect(range.endDate).toBe("2026-12-31");
  });

  it("orders custom ranges", () => {
    const range = resolveDateRange(
      DateRangePreset.CUSTOM,
      "2026-07-20",
      "2026-07-10",
      now,
    );
    expect(range.startDate).toBe("2026-07-10");
    expect(range.endDate).toBe("2026-07-20");
  });
});

describe("previousEqualLengthRange", () => {
  it("returns prior window of same length", () => {
    expect(previousEqualLengthRange("2026-07-01", "2026-07-31")).toEqual({
      startDate: "2026-05-31",
      endDate: "2026-06-30",
    });
  });
});

describe("assertValidDateRange", () => {
  it("rejects inverted ranges", () => {
    expect(() => assertValidDateRange("2026-07-10", "2026-07-01")).toThrow(
      /on or before/,
    );
  });

  it("accepts valid ranges", () => {
    expect(assertValidDateRange("2026-07-01", "2026-07-31")).toEqual({
      startDate: "2026-07-01",
      endDate: "2026-07-31",
    });
  });
});
