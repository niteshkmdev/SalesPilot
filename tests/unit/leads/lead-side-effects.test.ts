import { describe, expect, it } from "vitest";
import { LeadActivityAction } from "@/modules/activity/dto/activity.dto";
import {
  buildAssignLeadSideEffects,
  buildCreateLeadSideEffects,
  buildUpdateLeadSideEffects,
  type LeadSnapshot,
} from "@/modules/leads/services/lead-side-effects";

function snapshot(overrides: Partial<LeadSnapshot> = {}): LeadSnapshot {
  return {
    id: "lead1",
    organizationId: "org1",
    firstName: "Ada",
    lastName: "Lovelace",
    statusId: "st1",
    statusName: "New",
    assignedMemberId: null,
    assignedMemberName: null,
    assignedManagerId: null,
    assignedManagerName: null,
    firstNameValue: "Ada",
    lastNameValue: "Lovelace",
    email: "ada@example.com",
    phone: null,
    company: null,
    jobTitle: null,
    website: null,
    description: null,
    sourceId: null,
    ...overrides,
  };
}

describe("lead side effects", () => {
  it("records created + assignment notification when assignee is not actor", () => {
    const bundle = buildCreateLeadSideEffects({
      actorId: "actor",
      lead: snapshot({
        assignedMemberId: "member-1",
        assignedMemberName: "Priya",
      }),
    });

    expect(bundle.activities.map((a) => a.action)).toEqual([
      LeadActivityAction.CREATED,
      LeadActivityAction.ASSIGNED,
    ]);
    expect(bundle.notifications).toHaveLength(1);
    expect(bundle.notifications[0]?.memberId).toBe("member-1");
    expect(bundle.notifications[0]?.type).toBe("LEAD_ASSIGNED");
  });

  it("does not notify actor on self-assignment at create", () => {
    const bundle = buildCreateLeadSideEffects({
      actorId: "actor",
      lead: snapshot({
        assignedMemberId: "actor",
        assignedMemberName: "Me",
      }),
    });

    expect(bundle.notifications).toHaveLength(0);
  });

  it("notifies assigned member on status change and skips actor", () => {
    const before = snapshot({
      assignedMemberId: "member-1",
      assignedMemberName: "Priya",
    });
    const after = snapshot({
      statusId: "st2",
      statusName: "Qualified",
      assignedMemberId: "member-1",
      assignedMemberName: "Priya",
    });

    const bundle = buildUpdateLeadSideEffects({
      actorId: "actor",
      before,
      after,
      payload: { statusId: "st2" },
      customValuesChanged: false,
      resolvedStatusName: "Qualified",
    });

    expect(bundle.activities).toEqual([
      expect.objectContaining({ action: LeadActivityAction.STATUS_CHANGED }),
    ]);
    expect(bundle.notifications).toHaveLength(1);
    expect(bundle.notifications[0]).toMatchObject({
      memberId: "member-1",
      type: "LEAD_UPDATED",
    });
  });

  it("skips status notification when actor is the assigned member", () => {
    const before = snapshot({
      assignedMemberId: "actor",
      assignedMemberName: "Me",
    });
    const after = snapshot({
      statusId: "st2",
      statusName: "Qualified",
      assignedMemberId: "actor",
      assignedMemberName: "Me",
    });

    const bundle = buildUpdateLeadSideEffects({
      actorId: "actor",
      before,
      after,
      payload: { statusId: "st2" },
      customValuesChanged: false,
      resolvedStatusName: "Qualified",
    });

    expect(bundle.notifications).toHaveLength(0);
  });

  it("records reassignment and notifies new assignees only", () => {
    const before = snapshot({
      assignedMemberId: "old-member",
      assignedMemberName: "Old",
      assignedManagerId: "old-manager",
      assignedManagerName: "Old Mgr",
    });
    const after = snapshot({
      assignedMemberId: "new-member",
      assignedMemberName: "New",
      assignedManagerId: "new-manager",
      assignedManagerName: "New Mgr",
    });

    const bundle = buildAssignLeadSideEffects({
      actorId: "actor",
      before,
      after,
      memberChanged: true,
      managerChanged: true,
    });

    expect(bundle.activities[0]?.action).toBe(LeadActivityAction.REASSIGNED);
    expect(bundle.notifications.map((n) => n.memberId).sort()).toEqual([
      "new-manager",
      "new-member",
    ]);
  });

  it("does not notify when assignment is cleared", () => {
    const before = snapshot({
      assignedMemberId: "member-1",
      assignedMemberName: "Priya",
    });
    const after = snapshot({
      assignedMemberId: null,
      assignedMemberName: null,
    });

    const bundle = buildAssignLeadSideEffects({
      actorId: "actor",
      before,
      after,
      memberChanged: true,
      managerChanged: false,
    });

    expect(bundle.activities).toHaveLength(1);
    expect(bundle.notifications).toHaveLength(0);
  });

  it("records non-status field updates as lead.updated", () => {
    const before = snapshot({ description: "old" });
    const after = snapshot({ description: "new notes" });

    const bundle = buildUpdateLeadSideEffects({
      actorId: "actor",
      before,
      after,
      payload: { description: "new notes" },
      customValuesChanged: false,
    });

    expect(bundle.activities).toEqual([
      expect.objectContaining({
        action: LeadActivityAction.UPDATED,
        metadata: { fields: ["notes"] },
      }),
    ]);
    expect(bundle.notifications).toHaveLength(0);
  });
});
