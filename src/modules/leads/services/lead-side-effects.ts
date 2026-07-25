import type { NotificationType, Prisma } from "@prisma/client";
import {
  ActivityEntityType,
  LeadActivityAction,
  recordLeadActivity,
} from "@/modules/activity";
import { emptyToNull, type UpdateLeadDto } from "@/modules/leads/dto/lead.dto";
import { createNotification } from "@/modules/notifications";
import { prisma } from "@/server/db/prisma";

type AssigneeSnapshot = {
  id: string | null;
  name: string | null;
};

export type LeadSnapshot = {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  statusId: string;
  statusName: string;
  assignedMemberId: string | null;
  assignedMemberName: string | null;
  assignedManagerId: string | null;
  assignedManagerName: string | null;
  firstNameValue: string;
  lastNameValue: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  website: string | null;
  description: string | null;
  sourceId: string | null;
};

type PendingActivity = {
  action: string;
  metadata?: Prisma.InputJsonValue;
};

type PendingNotification = {
  memberId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Prisma.InputJsonValue;
};

export type LeadSideEffectBundle = {
  organizationId: string;
  actorId: string;
  leadId: string;
  activities: PendingActivity[];
  notifications: PendingNotification[];
};

const UPDATE_FIELD_LABELS: Record<string, string> = {
  firstName: "first name",
  lastName: "last name",
  email: "email",
  phone: "phone",
  company: "company",
  jobTitle: "job title",
  website: "website",
  description: "notes",
  sourceId: "source",
  customValues: "custom fields",
};

function normalizeId(value: string | null | undefined): string | null {
  return emptyToNull(value ?? undefined);
}

function leadDisplayName(lead: Pick<LeadSnapshot, "firstName" | "lastName">) {
  return `${lead.firstName} ${lead.lastName}`.trim();
}

export function toLeadSnapshot(lead: {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  statusId: string;
  status: { name: string } | null;
  assignedMemberId: string | null;
  assignedMember: { user: { name: string } } | null;
  assignedManagerId: string | null;
  assignedManager: { user: { name: string } } | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  website: string | null;
  description: string | null;
  sourceId: string | null;
}): LeadSnapshot {
  return {
    id: lead.id,
    organizationId: lead.organizationId,
    firstName: lead.firstName,
    lastName: lead.lastName,
    statusId: lead.statusId,
    statusName: lead.status?.name ?? "Unknown",
    assignedMemberId: lead.assignedMemberId,
    assignedMemberName: lead.assignedMember?.user.name ?? null,
    assignedManagerId: lead.assignedManagerId,
    assignedManagerName: lead.assignedManager?.user.name ?? null,
    firstNameValue: lead.firstName,
    lastNameValue: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    jobTitle: lead.jobTitle,
    website: lead.website,
    description: lead.description,
    sourceId: lead.sourceId,
  };
}

function assignmentAction(
  hadPriorAssignee: boolean,
): typeof LeadActivityAction.ASSIGNED | typeof LeadActivityAction.REASSIGNED {
  return hadPriorAssignee
    ? LeadActivityAction.REASSIGNED
    : LeadActivityAction.ASSIGNED;
}

function buildAssignmentActivity(input: {
  before: LeadSnapshot;
  afterMember: AssigneeSnapshot;
  afterManager: AssigneeSnapshot;
  memberChanged: boolean;
  managerChanged: boolean;
}): PendingActivity {
  const hadPrior =
    Boolean(input.before.assignedMemberId) ||
    Boolean(input.before.assignedManagerId);

  const metadata: Record<string, unknown> = {
    oldAssignedMemberId: input.before.assignedMemberId,
    oldAssignedMemberName: input.before.assignedMemberName,
    oldAssignedManagerId: input.before.assignedManagerId,
    oldAssignedManagerName: input.before.assignedManagerName,
  };

  if (input.memberChanged) {
    metadata.newAssignedMemberId = input.afterMember.id;
    metadata.newAssignedMemberName = input.afterMember.name;
  }
  if (input.managerChanged) {
    metadata.newAssignedManagerId = input.afterManager.id;
    metadata.newAssignedManagerName = input.afterManager.name;
  }

  return {
    action: assignmentAction(hadPrior),
    metadata: metadata as Prisma.InputJsonValue,
  };
}

function buildAssignmentNotifications(input: {
  actorId: string;
  lead: LeadSnapshot;
  afterMember: AssigneeSnapshot;
  afterManager: AssigneeSnapshot;
  memberChanged: boolean;
  managerChanged: boolean;
}): PendingNotification[] {
  const notifications: PendingNotification[] = [];
  const leadName = leadDisplayName(input.lead);
  const notified = new Set<string>();

  const pushAssign = (memberId: string | null) => {
    if (!memberId || memberId === input.actorId || notified.has(memberId)) {
      return;
    }
    notified.add(memberId);
    notifications.push({
      memberId,
      type: "LEAD_ASSIGNED",
      title: "Lead assigned",
      message: `You were assigned to ${leadName}.`,
      metadata: {
        leadId: input.lead.id,
        change: "assignment",
      },
    });
  };

  if (input.memberChanged) {
    pushAssign(input.afterMember.id);
  }
  if (input.managerChanged) {
    pushAssign(input.afterManager.id);
  }

  return notifications;
}

export function buildCreateLeadSideEffects(input: {
  actorId: string;
  lead: LeadSnapshot;
}): LeadSideEffectBundle {
  const activities: PendingActivity[] = [
    {
      action: LeadActivityAction.CREATED,
      metadata: {
        statusId: input.lead.statusId,
        statusName: input.lead.statusName,
      },
    },
  ];
  const notifications: PendingNotification[] = [];

  const memberId = input.lead.assignedMemberId;
  const managerId = input.lead.assignedManagerId;
  const hasAssignee =
    (memberId && memberId !== input.actorId) ||
    (managerId && managerId !== input.actorId);

  if (hasAssignee) {
    activities.push(
      buildAssignmentActivity({
        before: {
          ...input.lead,
          assignedMemberId: null,
          assignedMemberName: null,
          assignedManagerId: null,
          assignedManagerName: null,
        },
        afterMember: {
          id: memberId,
          name: input.lead.assignedMemberName,
        },
        afterManager: {
          id: managerId,
          name: input.lead.assignedManagerName,
        },
        memberChanged: Boolean(memberId),
        managerChanged: Boolean(managerId),
      }),
    );
    notifications.push(
      ...buildAssignmentNotifications({
        actorId: input.actorId,
        lead: input.lead,
        afterMember: { id: memberId, name: input.lead.assignedMemberName },
        afterManager: { id: managerId, name: input.lead.assignedManagerName },
        memberChanged: Boolean(memberId) && memberId !== input.actorId,
        managerChanged: Boolean(managerId) && managerId !== input.actorId,
      }),
    );
  }

  return {
    organizationId: input.lead.organizationId,
    actorId: input.actorId,
    leadId: input.lead.id,
    activities,
    notifications,
  };
}

export function buildUpdateLeadSideEffects(input: {
  actorId: string;
  before: LeadSnapshot;
  after: LeadSnapshot;
  payload: UpdateLeadDto;
  customValuesChanged: boolean;
  resolvedStatusName?: string;
}): LeadSideEffectBundle {
  const activities: PendingActivity[] = [];
  const notifications: PendingNotification[] = [];
  const { before, after, payload, actorId } = input;

  if (payload.statusId !== undefined && payload.statusId !== before.statusId) {
    const newStatusName =
      input.resolvedStatusName ?? after.statusName ?? "Unknown";
    activities.push({
      action: LeadActivityAction.STATUS_CHANGED,
      metadata: {
        oldStatusId: before.statusId,
        oldStatusName: before.statusName,
        newStatusId: payload.statusId,
        newStatusName,
      },
    });

    if (after.assignedMemberId && after.assignedMemberId !== actorId) {
      notifications.push({
        memberId: after.assignedMemberId,
        type: "LEAD_UPDATED",
        title: "Lead status updated",
        message: `Status for ${leadDisplayName(after)} changed from ${before.statusName} to ${newStatusName}.`,
        metadata: {
          leadId: after.id,
          change: "status",
          oldStatusName: before.statusName,
          newStatusName,
        },
      });
    }
  }

  const nextMemberId =
    payload.assignedMemberId !== undefined
      ? normalizeId(payload.assignedMemberId)
      : before.assignedMemberId;
  const nextManagerId =
    payload.assignedManagerId !== undefined
      ? normalizeId(payload.assignedManagerId)
      : before.assignedManagerId;

  const memberChanged =
    payload.assignedMemberId !== undefined &&
    nextMemberId !== before.assignedMemberId;
  const managerChanged =
    payload.assignedManagerId !== undefined &&
    nextManagerId !== before.assignedManagerId;

  if (memberChanged || managerChanged) {
    activities.push(
      buildAssignmentActivity({
        before,
        afterMember: {
          id: nextMemberId,
          name: after.assignedMemberName,
        },
        afterManager: {
          id: nextManagerId,
          name: after.assignedManagerName,
        },
        memberChanged,
        managerChanged,
      }),
    );
    notifications.push(
      ...buildAssignmentNotifications({
        actorId,
        lead: after,
        afterMember: {
          id: nextMemberId,
          name: after.assignedMemberName,
        },
        afterManager: {
          id: nextManagerId,
          name: after.assignedManagerName,
        },
        memberChanged,
        managerChanged,
      }),
    );
  }

  const changedFields: string[] = [];
  const scalarChecks: Array<[keyof UpdateLeadDto, keyof LeadSnapshot, string]> =
    [
      ["firstName", "firstNameValue", "firstName"],
      ["lastName", "lastNameValue", "lastName"],
      ["email", "email", "email"],
      ["phone", "phone", "phone"],
      ["company", "company", "company"],
      ["jobTitle", "jobTitle", "jobTitle"],
      ["website", "website", "website"],
      ["description", "description", "description"],
      ["sourceId", "sourceId", "sourceId"],
    ];

  for (const [payloadKey, beforeKey, labelKey] of scalarChecks) {
    if (payload[payloadKey] === undefined) continue;
    const next =
      typeof payload[payloadKey] === "string"
        ? emptyToNull(payload[payloadKey] as string)
        : payload[payloadKey];
    const prev = before[beforeKey];
    if (next !== prev) {
      changedFields.push(UPDATE_FIELD_LABELS[labelKey] ?? labelKey);
    }
  }

  if (input.customValuesChanged) {
    changedFields.push(UPDATE_FIELD_LABELS.customValues);
  }

  if (changedFields.length > 0) {
    activities.push({
      action: LeadActivityAction.UPDATED,
      metadata: { fields: changedFields },
    });
  }

  return {
    organizationId: before.organizationId,
    actorId,
    leadId: before.id,
    activities,
    notifications,
  };
}

export function buildAssignLeadSideEffects(input: {
  actorId: string;
  before: LeadSnapshot;
  after: LeadSnapshot;
  memberChanged: boolean;
  managerChanged: boolean;
}): LeadSideEffectBundle {
  if (!input.memberChanged && !input.managerChanged) {
    return {
      organizationId: input.before.organizationId,
      actorId: input.actorId,
      leadId: input.before.id,
      activities: [],
      notifications: [],
    };
  }

  return {
    organizationId: input.before.organizationId,
    actorId: input.actorId,
    leadId: input.before.id,
    activities: [
      buildAssignmentActivity({
        before: input.before,
        afterMember: {
          id: input.after.assignedMemberId,
          name: input.after.assignedMemberName,
        },
        afterManager: {
          id: input.after.assignedManagerId,
          name: input.after.assignedManagerName,
        },
        memberChanged: input.memberChanged,
        managerChanged: input.managerChanged,
      }),
    ],
    notifications: buildAssignmentNotifications({
      actorId: input.actorId,
      lead: input.after,
      afterMember: {
        id: input.after.assignedMemberId,
        name: input.after.assignedMemberName,
      },
      afterManager: {
        id: input.after.assignedManagerId,
        name: input.after.assignedManagerName,
      },
      memberChanged: input.memberChanged,
      managerChanged: input.managerChanged,
    }),
  };
}

export function buildDeleteLeadSideEffects(input: {
  actorId: string;
  lead: LeadSnapshot;
}): LeadSideEffectBundle {
  return {
    organizationId: input.lead.organizationId,
    actorId: input.actorId,
    leadId: input.lead.id,
    activities: [{ action: LeadActivityAction.DELETED }],
    notifications: [],
  };
}

/** Best-effort after lead mutation commit — never throws to callers. */
export async function applyLeadSideEffects(
  bundle: LeadSideEffectBundle,
): Promise<void> {
  if (bundle.activities.length === 0 && bundle.notifications.length === 0) {
    return;
  }

  try {
    for (const activity of bundle.activities) {
      await recordLeadActivity(prisma, {
        organizationId: bundle.organizationId,
        actorId: bundle.actorId,
        leadId: bundle.leadId,
        action: activity.action,
        metadata: activity.metadata,
      });
    }

    for (const notification of bundle.notifications) {
      await createNotification(prisma, {
        organizationId: bundle.organizationId,
        memberId: notification.memberId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata,
      });
    }
  } catch (error) {
    console.error(
      "[lead-side-effects] Failed to record activity/notifications",
      {
        leadId: bundle.leadId,
        entityType: ActivityEntityType.LEAD,
        error,
      },
    );
  }
}
