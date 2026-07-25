import type { Prisma } from "@prisma/client";

export const ActivityEntityType = {
  LEAD: "lead",
} as const;

export type ActivityEntityType =
  (typeof ActivityEntityType)[keyof typeof ActivityEntityType];

export const LeadActivityAction = {
  CREATED: "lead.created",
  CREATED_FROM_FORM: "lead.created_from_form",
  UPDATED: "lead.updated",
  STATUS_CHANGED: "lead.status_changed",
  ASSIGNED: "lead.assigned",
  REASSIGNED: "lead.reassigned",
  DELETED: "lead.deleted",
} as const;

export type LeadActivityAction =
  (typeof LeadActivityAction)[keyof typeof LeadActivityAction];

export interface ActivityActorDto {
  id: string;
  name: string;
}

export interface ActivityDto {
  id: string;
  action: string;
  summary: string;
  actor: ActivityActorDto | null;
  metadata: Prisma.JsonValue | null;
  createdAt: string;
}

export interface RecordActivityInput {
  organizationId: string;
  actorId: string | null;
  entityType: string;
  entityId: string;
  action: string;
  metadata?: Prisma.InputJsonValue;
}
