import { describe, expect, it } from "vitest";

function conversionRate(won: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((won / total) * 1000) / 10;
}

describe("dashboard conversionRate", () => {
  it("returns 0 when total is 0", () => {
    expect(conversionRate(0, 0)).toBe(0);
  });

  it("rounds to one decimal", () => {
    expect(conversionRate(1, 3)).toBe(33.3);
    expect(conversionRate(31, 248)).toBe(12.5);
  });
});
