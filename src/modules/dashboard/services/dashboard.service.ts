import type { Prisma } from "@prisma/client";
import { toActivityDto } from "@/modules/activity";
import { listRecentLeadActivities } from "@/modules/activity/repository/activity.repository";
import { requireAppContext } from "@/modules/auth/services/app-context.service";
import {
  type DashboardOverviewDto,
  type DashboardQuery,
  DEFAULT_DASHBOARD_PRESET,
} from "@/modules/dashboard/dto/dashboard.dto";
import {
  countLeads,
  findManyLeads,
  getStatuses,
  groupLeadsByStatus,
  listLeadIds,
} from "@/modules/leads/repository/lead.repository";
import {
  buildLeadVisibilityWhere,
  mergeLeadListWhere,
} from "@/modules/leads/services/lead-access";
import { getMyUnreadCount, listMyNotifications } from "@/modules/notifications";
import { Permissions } from "@/modules/permissions/constants/permissions";
import { createAuthorizationService } from "@/modules/permissions/services/authorization.service";
import { prisma } from "@/server/db/prisma";
import { validationFailed } from "@/shared/api/errors";
import {
  assertValidDateRange,
  DATE_RANGE_PRESET_LABELS,
  DateRangePreset,
  parseDayEnd,
  parseDayStart,
  previousEqualLengthRange,
  resolveDateRange,
} from "@/shared/dates";

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function createdAtRangeWhere(
  startDate: string,
  endDate: string,
): Prisma.LeadWhereInput {
  return {
    createdAt: {
      gte: parseDayStart(startDate),
      lte: parseDayEnd(endDate),
    },
  };
}

function formatDelta(current: number, previous: number, noun: string): string {
  const delta = current - previous;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta} vs prior ${noun}`;
}

function conversionRate(won: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((won / total) * 1000) / 10;
}

export async function getDashboardOverview(
  query: DashboardQuery,
): Promise<DashboardOverviewDto> {
  const ctx = await requireAppContext();
  const authz = createAuthorizationService(ctx.permissions);
  await authz.require(Permissions.DASHBOARD_READ);

  let rangeDates: { startDate: string; endDate: string };
  try {
    rangeDates = assertValidDateRange(query.startDate, query.endDate);
  } catch (error) {
    throw validationFailed(
      error instanceof Error ? error.message : "Invalid date range.",
    );
  }

  const preset = query.preset ?? DEFAULT_DASHBOARD_PRESET;
  const label =
    preset === DateRangePreset.CUSTOM
      ? `${rangeDates.startDate} → ${rangeDates.endDate}`
      : DATE_RANGE_PRESET_LABELS[preset];

  const visibility = buildLeadVisibilityWhere(
    ctx.member.roleName,
    ctx.member.id,
  );
  const periodWhere = mergeLeadListWhere(
    createdAtRangeWhere(rangeDates.startDate, rangeDates.endDate),
    visibility,
  );

  const previous = previousEqualLengthRange(
    rangeDates.startDate,
    rangeDates.endDate,
  );
  const previousWhere = previous
    ? mergeLeadListWhere(
        createdAtRangeWhere(previous.startDate, previous.endDate),
        visibility,
      )
    : null;

  const statuses = await getStatuses(prisma, ctx.organization.id);
  const qualifiedStatusIds = statuses
    .filter((status) => status.name === "Qualified")
    .map((status) => status.id);
  const wonStatusIds = statuses
    .filter((status) => status.isWon)
    .map((status) => status.id);

  const [
    total,
    qualified,
    won,
    previousTotal,
    previousWon,
    statusGroups,
    assignedRows,
    activityRows,
    notifications,
    unreadNotificationCount,
    canCreateLead,
    canInviteMember,
  ] = await Promise.all([
    countLeads(prisma, ctx.organization.id, periodWhere),
    qualifiedStatusIds.length
      ? countLeads(
          prisma,
          ctx.organization.id,
          mergeLeadListWhere(
            {
              ...createdAtRangeWhere(rangeDates.startDate, rangeDates.endDate),
              statusId: { in: qualifiedStatusIds },
            },
            visibility,
          ),
        )
      : Promise.resolve(0),
    wonStatusIds.length
      ? countLeads(
          prisma,
          ctx.organization.id,
          mergeLeadListWhere(
            {
              ...createdAtRangeWhere(rangeDates.startDate, rangeDates.endDate),
              statusId: { in: wonStatusIds },
            },
            visibility,
          ),
        )
      : Promise.resolve(0),
    previousWhere
      ? countLeads(prisma, ctx.organization.id, previousWhere)
      : Promise.resolve(0),
    previousWhere && previous && wonStatusIds.length
      ? countLeads(
          prisma,
          ctx.organization.id,
          mergeLeadListWhere(
            {
              ...createdAtRangeWhere(previous.startDate, previous.endDate),
              statusId: { in: wonStatusIds },
            },
            visibility,
          ),
        )
      : Promise.resolve(0),
    groupLeadsByStatus(prisma, ctx.organization.id, periodWhere),
    findManyLeads(prisma, ctx.organization.id, {
      where: periodWhere,
      take: 8,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    }),
    (async () => {
      const leadIds = await listLeadIds(
        prisma,
        ctx.organization.id,
        visibility ?? {},
        500,
      );
      if (leadIds.length === 0) return [];
      return listRecentLeadActivities(prisma, {
        organizationId: ctx.organization.id,
        leadIds,
        createdFrom: parseDayStart(rangeDates.startDate),
        createdTo: parseDayEnd(rangeDates.endDate),
        take: 10,
      });
    })(),
    listMyNotifications({ limit: 5 }).catch(() => []),
    getMyUnreadCount().catch(() => 0),
    authz.can(Permissions.LEAD_CREATE),
    authz.can(Permissions.MEMBER_INVITE),
  ]);

  const countByStatusId = new Map(
    statusGroups.map((row) => [row.statusId, row._count._all]),
  );
  const maxPipeline = Math.max(
    0,
    ...statuses.map((status) => countByStatusId.get(status.id) ?? 0),
  );

  const conversion = conversionRate(won, total);
  const previousConversion = conversionRate(previousWon, previousTotal);
  const conversionDelta =
    Math.round((conversion - previousConversion) * 10) / 10;

  const periodNoun =
    preset === DateRangePreset.THIS_WEEK
      ? "week"
      : preset === DateRangePreset.THIS_YEAR
        ? "year"
        : "period";

  return {
    range: {
      preset,
      startDate: rangeDates.startDate,
      endDate: rangeDates.endDate,
      label,
    },
    metrics: [
      {
        label: "Total Leads",
        value: String(total),
        change: formatDelta(total, previousTotal, periodNoun),
      },
      {
        label: "Qualified Leads",
        value: String(qualified),
        change:
          total > 0
            ? `${Math.round((qualified / total) * 100)}% of pipeline`
            : "0% of pipeline",
      },
      {
        label: "Won Leads",
        value: String(won),
        change: formatDelta(won, previousWon, periodNoun),
      },
      {
        label: "Conversion Rate",
        value: `${conversion}%`,
        change: `${conversionDelta >= 0 ? "+" : ""}${conversionDelta} from prior ${periodNoun}`,
      },
    ],
    pipeline: statuses.map((status) => {
      const value = countByStatusId.get(status.id) ?? 0;
      const width =
        maxPipeline > 0 ? `${Math.round((value / maxPipeline) * 100)}%` : "0%";
      return { stage: status.name, value, width };
    }),
    assignedLeads: assignedRows.map((lead) => {
      const ownerName =
        lead.assignedMember?.user.name ??
        lead.assignedManager?.user.name ??
        "Unassigned";
      return {
        id: lead.id,
        company: lead.company?.trim() || "—",
        contact: `${lead.firstName} ${lead.lastName}`.trim(),
        status: lead.status?.name ?? "Unknown",
        owner: initials(ownerName),
        updatedAt: lead.updatedAt.toISOString(),
      };
    }),
    activity: activityRows.map((row) => {
      const dto = toActivityDto(row);
      return {
        id: dto.id,
        summary: dto.summary,
        createdAt: dto.createdAt,
      };
    }),
    notifications: notifications.map((item) => ({
      id: item.id,
      title: item.title,
      message: item.message,
      readAt: item.readAt,
      createdAt: item.createdAt,
      leadId: item.leadId,
    })),
    unreadNotificationCount,
    capabilities: {
      canCreateLead,
      canInviteMember,
    },
  };
}

/** Resolve query from URL search params with this-month default. */
export function resolveDashboardQuery(input: {
  preset?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}): DashboardQuery {
  const presetRaw = input.preset;
  const preset =
    presetRaw === DateRangePreset.THIS_WEEK ||
    presetRaw === DateRangePreset.THIS_MONTH ||
    presetRaw === DateRangePreset.THIS_YEAR ||
    presetRaw === DateRangePreset.CUSTOM
      ? presetRaw
      : DEFAULT_DASHBOARD_PRESET;

  if (preset === DateRangePreset.CUSTOM && input.startDate && input.endDate) {
    return {
      preset,
      startDate: input.startDate,
      endDate: input.endDate,
    };
  }

  const resolved = resolveDateRange(
    preset === DateRangePreset.CUSTOM ? DEFAULT_DASHBOARD_PRESET : preset,
    input.startDate,
    input.endDate,
  );

  return {
    preset: resolved.preset,
    startDate: resolved.startDate,
    endDate: resolved.endDate,
  };
}
