import type { Prisma } from "@prisma/client";
import {
  type ActivityDto,
  ActivityEntityType,
  type RecordActivityInput,
} from "@/modules/activity/dto/activity.dto";
import {
  type ActivityWithActor,
  createActivity,
  listActivitiesByEntity,
} from "@/modules/activity/repository/activity.repository";
import { formatActivitySummary } from "@/modules/activity/services/format-activity";
import { requireAppContext } from "@/modules/auth/services/app-context.service";
import { findLeadById } from "@/modules/leads/repository/lead.repository";
import { assertLeadVisible } from "@/modules/leads/services/lead-access";
import { Permissions } from "@/modules/permissions/constants/permissions";
import { createAuthorizationService } from "@/modules/permissions/services/authorization.service";
import { prisma } from "@/server/db/prisma";
import type { DatabaseClient } from "@/server/db/types";
import { notFound } from "@/shared/api/errors";

export function toActivityDto(row: ActivityWithActor): ActivityDto {
  const actorName = row.actor?.user.name ?? null;
  return {
    id: row.id,
    action: row.action,
    summary: formatActivitySummary(row.action, actorName, row.metadata),
    actor: row.actor ? { id: row.actor.id, name: row.actor.user.name } : null,
    metadata: row.metadata,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Internal append-only write. Prefer calling via lead side-effects. */
export async function recordActivity(
  db: DatabaseClient,
  data: RecordActivityInput,
) {
  return createActivity(db, data);
}

export async function listLeadTimeline(
  leadId: string,
  options?: { page?: number; limit?: number },
): Promise<ActivityDto[]> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.ACTIVITY_READ,
  );

  const lead = await findLeadById(prisma, leadId, ctx.organization.id);
  if (!lead) {
    throw notFound("Lead not found.");
  }

  assertLeadVisible(lead, ctx.member.roleName, ctx.member.id);

  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const skip = (page - 1) * limit;

  const rows = await listActivitiesByEntity(prisma, {
    organizationId: ctx.organization.id,
    entityType: ActivityEntityType.LEAD,
    entityId: leadId,
    skip,
    take: limit,
  });

  return rows.map(toActivityDto);
}

export async function recordLeadActivity(
  db: DatabaseClient,
  input: {
    organizationId: string;
    actorId: string | null;
    leadId: string;
    action: string;
    metadata?: Prisma.InputJsonValue;
  },
) {
  return recordActivity(db, {
    organizationId: input.organizationId,
    actorId: input.actorId,
    entityType: ActivityEntityType.LEAD,
    entityId: input.leadId,
    action: input.action,
    metadata: input.metadata,
  });
}
