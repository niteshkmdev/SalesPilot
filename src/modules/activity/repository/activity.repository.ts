import type { Prisma } from "@prisma/client";
import type { RecordActivityInput } from "@/modules/activity/dto/activity.dto";
import type { DatabaseClient } from "@/server/db/types";

export async function createActivity(
  db: DatabaseClient,
  data: RecordActivityInput,
) {
  return db.activity.create({
    data: {
      organizationId: data.organizationId,
      actorId: data.actorId,
      entityType: data.entityType,
      entityId: data.entityId,
      action: data.action,
      metadata: data.metadata,
    },
  });
}

export async function listActivitiesByEntity(
  db: DatabaseClient,
  options: {
    organizationId: string;
    entityType: string;
    entityId: string;
    skip?: number;
    take?: number;
  },
) {
  return db.activity.findMany({
    where: {
      organizationId: options.organizationId,
      entityType: options.entityType,
      entityId: options.entityId,
    },
    include: {
      actor: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: options.skip,
    take: options.take ?? 20,
  });
}

export async function listRecentLeadActivities(
  db: DatabaseClient,
  options: {
    organizationId: string;
    leadIds?: string[];
    createdFrom?: Date;
    createdTo?: Date;
    take?: number;
  },
) {
  const createdAt: Prisma.DateTimeFilter = {};
  if (options.createdFrom) createdAt.gte = options.createdFrom;
  if (options.createdTo) createdAt.lte = options.createdTo;

  return db.activity.findMany({
    where: {
      organizationId: options.organizationId,
      entityType: "lead",
      ...(options.leadIds ? { entityId: { in: options.leadIds } } : {}),
      ...(Object.keys(createdAt).length > 0 ? { createdAt } : {}),
    },
    include: {
      actor: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
    take: options.take ?? 10,
  });
}

export type ActivityWithActor = Prisma.ActivityGetPayload<{
  include: { actor: { include: { user: true } } };
}>;
