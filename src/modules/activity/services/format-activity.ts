import type { Prisma } from "@prisma/client";
import { LeadActivityAction } from "@/modules/activity/dto/activity.dto";

function asRecord(
  value: Prisma.JsonValue | null | undefined,
): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function stringField(
  meta: Record<string, unknown> | null,
  key: string,
): string | null {
  const value = meta?.[key];
  return typeof value === "string" && value.trim() ? value : null;
}

export function formatActivitySummary(
  action: string,
  actorName: string | null,
  metadata: Prisma.JsonValue | null,
): string {
  const actor = actorName?.trim() || "Someone";
  const meta = asRecord(metadata);

  switch (action) {
    case LeadActivityAction.CREATED:
      return `${actor} created this lead.`;
    case LeadActivityAction.CREATED_FROM_FORM:
      return `Lead created from a public form.`;
    case LeadActivityAction.DELETED:
      return `${actor} archived this lead.`;
    case LeadActivityAction.STATUS_CHANGED: {
      const from = stringField(meta, "oldStatusName") ?? "previous status";
      const to = stringField(meta, "newStatusName") ?? "new status";
      return `${actor} changed status from ${from} to ${to}.`;
    }
    case LeadActivityAction.ASSIGNED:
    case LeadActivityAction.REASSIGNED: {
      const member =
        stringField(meta, "newAssignedMemberName") ??
        (meta?.newAssignedMemberId === null ? "Unassigned" : null);
      const manager =
        stringField(meta, "newAssignedManagerName") ??
        (meta?.newAssignedManagerId === null ? "Unassigned" : null);
      const parts: string[] = [];
      if (member !== null && meta?.newAssignedMemberId !== undefined) {
        parts.push(`member ${member}`);
      }
      if (manager !== null && meta?.newAssignedManagerId !== undefined) {
        parts.push(`manager ${manager}`);
      }
      if (parts.length === 0) {
        return action === LeadActivityAction.REASSIGNED
          ? `${actor} reassigned this lead.`
          : `${actor} assigned this lead.`;
      }
      const verb =
        action === LeadActivityAction.REASSIGNED ? "reassigned" : "assigned";
      return `${actor} ${verb} this lead to ${parts.join(" and ")}.`;
    }
    case LeadActivityAction.UPDATED: {
      const fields = meta?.fields;
      if (Array.isArray(fields) && fields.length > 0) {
        const labels = fields
          .filter((f): f is string => typeof f === "string")
          .join(", ");
        return labels
          ? `${actor} updated ${labels}.`
          : `${actor} updated this lead.`;
      }
      return `${actor} updated this lead.`;
    }
    default:
      return `${actor} performed ${action}.`;
  }
}
