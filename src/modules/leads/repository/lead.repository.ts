import type { Prisma } from "@prisma/client";
import {
  type CreateLeadDto,
  emptyToNull,
  type LeadListFilters,
  type UpdateLeadDto,
} from "@/modules/leads/dto/lead.dto";
import type { DatabaseClient } from "@/server/db/types";

function toCreateData(data: CreateLeadDto & { isDuplicate?: boolean }) {
  return {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: emptyToNull(data.email),
    phone: emptyToNull(data.phone),
    company: emptyToNull(data.company),
    jobTitle: emptyToNull(data.jobTitle),
    website: emptyToNull(data.website),
    description: emptyToNull(data.description),
    statusId: data.statusId,
    sourceId: emptyToNull(data.sourceId),
    assignedManagerId: emptyToNull(data.assignedManagerId),
    assignedMemberId: emptyToNull(data.assignedMemberId),
    isDuplicate: data.isDuplicate ?? false,
  };
}

function parseDayStart(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);
  return date;
}

function parseDayEnd(value: string): Date {
  const date = new Date(`${value}T23:59:59.999Z`);
  return date;
}

export function buildListWhere(
  filters?: Partial<LeadListFilters>,
): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};

  if (filters?.statusId) {
    where.statusId = filters.statusId;
  }

  if (filters?.sourceId) {
    where.sourceId = filters.sourceId;
  }

  if (filters?.assignedMemberId) {
    where.assignedMemberId = filters.assignedMemberId;
  }

  if (filters?.assignedManagerId) {
    where.assignedManagerId = filters.assignedManagerId;
  }

  if (filters?.isDuplicate !== undefined) {
    where.isDuplicate = filters.isDuplicate;
  }

  const createdAt: Prisma.DateTimeFilter = {};
  if (filters?.createdFrom) {
    createdAt.gte = parseDayStart(filters.createdFrom);
  }
  if (filters?.createdTo) {
    createdAt.lte = parseDayEnd(filters.createdTo);
  }
  if (Object.keys(createdAt).length > 0) {
    where.createdAt = createdAt;
  }

  const updatedAt: Prisma.DateTimeFilter = {};
  if (filters?.updatedFrom) {
    updatedAt.gte = parseDayStart(filters.updatedFrom);
  }
  if (filters?.updatedTo) {
    updatedAt.lte = parseDayEnd(filters.updatedTo);
  }
  if (Object.keys(updatedAt).length > 0) {
    where.updatedAt = updatedAt;
  }

  const q = filters?.q?.trim();
  if (q) {
    // Escape regex metacharacters — MongoDB insensitive mode uses RegEx.
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    where.OR = [
      { firstName: { contains: safe, mode: "insensitive" } },
      { lastName: { contains: safe, mode: "insensitive" } },
      { email: { contains: safe, mode: "insensitive" } },
      { phone: { contains: safe, mode: "insensitive" } },
      { company: { contains: safe, mode: "insensitive" } },
    ];
  }

  return where;
}

export function buildListOrderBy(
  sort: LeadListFilters["sort"] = "updatedAt",
  order: LeadListFilters["order"] = "desc",
): Prisma.LeadOrderByWithRelationInput | Prisma.LeadOrderByWithRelationInput[] {
  if (sort === "updatedAt") {
    // Stable fallback when updatedAt is unset/equal (MongoDB edge cases).
    return [{ updatedAt: order }, { createdAt: order }];
  }
  return { [sort]: order };
}

/**
 * MongoDB treats missing optional fields as unset, not null.
 * `deletedAt: null` alone excludes leads that never had the field written.
 */
export function notDeletedWhere(): Prisma.LeadWhereInput {
  return {
    OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
  };
}

export async function createLead(
  db: DatabaseClient,
  organizationId: string,
  createdById: string,
  data: CreateLeadDto & { isDuplicate?: boolean },
) {
  return db.lead.create({
    data: {
      organizationId,
      createdBy: createdById,
      deletedAt: null,
      ...toCreateData(data),
    },
  });
}

export async function updateLead(
  db: DatabaseClient,
  leadId: string,
  updatedById: string,
  data: UpdateLeadDto,
) {
  const patch: Prisma.LeadUpdateInput = {
    updater: { connect: { id: updatedById } },
  };

  if (data.firstName !== undefined) patch.firstName = data.firstName.trim();
  if (data.lastName !== undefined) patch.lastName = data.lastName.trim();
  if (data.email !== undefined) patch.email = emptyToNull(data.email);
  if (data.phone !== undefined) patch.phone = emptyToNull(data.phone);
  if (data.company !== undefined) patch.company = emptyToNull(data.company);
  if (data.jobTitle !== undefined) patch.jobTitle = emptyToNull(data.jobTitle);
  if (data.website !== undefined) patch.website = emptyToNull(data.website);
  if (data.description !== undefined) {
    patch.description = emptyToNull(data.description);
  }
  if (data.statusId !== undefined) {
    patch.status = { connect: { id: data.statusId } };
  }
  if (data.sourceId !== undefined) {
    const sourceId = emptyToNull(data.sourceId);
    patch.source = sourceId
      ? { connect: { id: sourceId } }
      : { disconnect: true };
  }
  if (data.assignedMemberId !== undefined) {
    const assignedMemberId = emptyToNull(data.assignedMemberId);
    patch.assignedMember = assignedMemberId
      ? { connect: { id: assignedMemberId } }
      : { disconnect: true };
  }
  if (data.assignedManagerId !== undefined) {
    const assignedManagerId = emptyToNull(data.assignedManagerId);
    patch.assignedManager = assignedManagerId
      ? { connect: { id: assignedManagerId } }
      : { disconnect: true };
  }
  if (data.isDuplicate !== undefined) patch.isDuplicate = data.isDuplicate;

  return db.lead.update({
    where: { id: leadId },
    data: patch,
  });
}

export async function findLeadById(
  db: DatabaseClient,
  leadId: string,
  organizationId: string,
) {
  return db.lead.findFirst({
    where: {
      id: leadId,
      organizationId,
      AND: [notDeletedWhere()],
    },
    include: {
      status: true,
      source: true,
      assignedMember: { include: { user: true } },
      assignedManager: { include: { user: true } },
    },
  });
}

export async function findManyLeads(
  db: DatabaseClient,
  organizationId: string,
  options?: {
    skip?: number;
    take?: number;
    where?: Prisma.LeadWhereInput;
    orderBy?:
      | Prisma.LeadOrderByWithRelationInput
      | Prisma.LeadOrderByWithRelationInput[];
  },
) {
  return db.lead.findMany({
    where: {
      organizationId,
      AND: [notDeletedWhere(), options?.where ?? {}],
    },
    include: {
      status: true,
      source: true,
      assignedMember: { include: { user: true } },
      assignedManager: { include: { user: true } },
    },
    skip: options?.skip,
    take: options?.take,
    orderBy: options?.orderBy || [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function countLeads(
  db: DatabaseClient,
  organizationId: string,
  where?: Prisma.LeadWhereInput,
) {
  return db.lead.count({
    where: {
      organizationId,
      AND: [notDeletedWhere(), where ?? {}],
    },
  });
}

export async function softDeleteLead(
  db: DatabaseClient,
  leadId: string,
  deletedById: string,
) {
  return db.lead.update({
    where: { id: leadId },
    data: {
      deletedAt: new Date(),
      updater: { connect: { id: deletedById } },
    },
  });
}

export async function findDuplicateCandidates(
  db: DatabaseClient,
  organizationId: string,
  email: string | null | undefined,
  phone: string | null | undefined,
  excludeLeadId?: string,
) {
  const or: Prisma.LeadWhereInput[] = [];
  const normalizedEmail = emptyToNull(email);
  const normalizedPhone = emptyToNull(phone);

  if (normalizedEmail) {
    or.push({ email: { equals: normalizedEmail, mode: "insensitive" } });
  }
  if (normalizedPhone) {
    or.push({ phone: normalizedPhone });
  }

  if (or.length === 0) {
    return [];
  }

  return db.lead.findMany({
    where: {
      organizationId,
      AND: [
        notDeletedWhere(),
        ...(excludeLeadId ? [{ id: { not: excludeLeadId } }] : []),
        { OR: or },
      ],
    },
    select: { id: true },
    take: 5,
  });
}

export async function getDefaultStatus(
  db: DatabaseClient,
  organizationId: string,
) {
  return db.organizationLeadStatus.findFirst({
    where: { organizationId, isDefault: true },
  });
}

export async function getStatuses(db: DatabaseClient, organizationId: string) {
  return db.organizationLeadStatus.findMany({
    where: { organizationId },
    orderBy: { displayOrder: "asc" },
  });
}

export async function getSources(db: DatabaseClient, organizationId: string) {
  return db.organizationLeadSource.findMany({
    where: { organizationId, active: true },
    orderBy: { displayOrder: "asc" },
  });
}

export async function memberExistsInOrganization(
  db: DatabaseClient,
  organizationId: string,
  memberId: string,
) {
  const member = await db.organizationMember.findFirst({
    where: { id: memberId, organizationId },
    select: { id: true },
  });
  return Boolean(member);
}
