import { describe, expect, it } from "vitest";
import { LeadActivityAction } from "@/modules/activity/dto/activity.dto";
import { formatActivitySummary } from "@/modules/activity/services/format-activity";

describe("formatActivitySummary", () => {
  it("formats lead created", () => {
    expect(formatActivitySummary(LeadActivityAction.CREATED, "Ada", null)).toBe(
      "Ada created this lead.",
    );
  });

  it("formats status change with names", () => {
    expect(
      formatActivitySummary(LeadActivityAction.STATUS_CHANGED, "Ada", {
        oldStatusName: "New",
        newStatusName: "Qualified",
      }),
    ).toBe("Ada changed status from New to Qualified.");
  });

  it("formats assignment with member and manager", () => {
    expect(
      formatActivitySummary(LeadActivityAction.ASSIGNED, "Ada", {
        newAssignedMemberId: "m2",
        newAssignedMemberName: "Priya",
        newAssignedManagerId: "m3",
        newAssignedManagerName: "Rahul",
      }),
    ).toBe("Ada assigned this lead to member Priya and manager Rahul.");
  });

  it("formats field updates", () => {
    expect(
      formatActivitySummary(LeadActivityAction.UPDATED, "Ada", {
        fields: ["email", "notes"],
      }),
    ).toBe("Ada updated email, notes.");
  });

  it("falls back when actor is missing", () => {
    expect(formatActivitySummary(LeadActivityAction.DELETED, null, null)).toBe(
      "Someone archived this lead.",
    );
  });
});
