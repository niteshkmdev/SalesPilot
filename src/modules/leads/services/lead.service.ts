import type { Prisma } from "@prisma/client";
import { requireAppContext } from "@/modules/auth/services/app-context.service";
import {
  getLeadCustomValues,
  normalizeCustomValuesForOrganization,
  replaceLeadCustomValues,
} from "@/modules/custom-fields";
import {
  type AssignLeadDto,
  type CreateLeadDto,
  emptyToNull,
  type LeadAssigneeOptionDto,
  type LeadDetailDto,
  type LeadListFilters,
  type LeadListResultDto,
  type LeadSourceDto,
  type LeadStatusDto,
  type UpdateLeadDto,
} from "@/modules/leads/dto/lead.dto";
import {
  toLeadDetailDto,
  toLeadListItemDto,
  toSourceDto,
  toStatusDto,
} from "@/modules/leads/dto/lead.mapper";
import {
  buildListOrderBy,
  buildListWhere,
  countLeads,
  createLead as createLeadRecord,
  findDuplicateCandidates,
  findLeadById,
  findManyLeads,
  getDefaultStatus,
  getSources as getSourceRecords,
  getStatuses as getStatusRecords,
  softDeleteLead,
  updateLead as updateLeadRecord,
} from "@/modules/leads/repository/lead.repository";
import {
  assertLeadVisible,
  buildLeadVisibilityWhere,
  canEditWithoutAssign,
  mergeLeadListWhere,
} from "@/modules/leads/services/lead-access";
import { systemRoleNames } from "@/modules/organizations/constants/default-roles";
import {
  findMemberById,
  listMembersByOrganization,
} from "@/modules/organizations/repository/member.repository";
import { Permissions } from "@/modules/permissions/constants/permissions";
import { createAuthorizationService } from "@/modules/permissions/services/authorization.service";
import { prisma } from "@/server/db/prisma";
import {
  notFound,
  permissionDenied,
  validationFailed,
} from "@/shared/api/errors";

const MEMBER_ASSIGNEE_ROLES = new Set<string>([systemRoleNames.member]);

const MANAGER_ASSIGNEE_ROLES = new Set<string>([
  systemRoleNames.owner,
  systemRoleNames.admin,
  systemRoleNames.manager,
]);

const LIMITED_UPDATE_KEYS = new Set(["statusId", "description"]);

async function resolveIsDuplicate(
  organizationId: string,
  email: string | null | undefined,
  phone: string | null | undefined,
  excludeLeadId?: string,
): Promise<boolean> {
  const matches = await findDuplicateCandidates(
    prisma,
    organizationId,
    email,
    phone,
    excludeLeadId,
  );
  return matches.length > 0;
}

async function assertAssigneeRole(
  organizationId: string,
  memberId: string | null | undefined,
  allowedRoles: Set<string>,
  label: string,
) {
  if (!memberId) return;
  const member = await findMemberById(prisma, memberId);
  if (!member || member.organizationId !== organizationId) {
    throw validationFailed(`${label} is not a member of this organization.`);
  }
  if (!allowedRoles.has(member.role.name)) {
    throw validationFailed(`${label} must have an allowed role.`);
  }
}

function assertLimitedUpdatePayload(data: UpdateLeadDto) {
  const disallowed = Object.entries(data).filter(([key, value]) => {
    if (value === undefined) return false;
    return !LIMITED_UPDATE_KEYS.has(key);
  });
  if (disallowed.length > 0) {
    throw permissionDenied();
  }
}

function toAssigneeOption(member: {
  id: string;
  user: { name: string; email: string };
  role: { name: string };
}): LeadAssigneeOptionDto {
  return {
    id: member.id,
    name: member.user.name,
    email: member.user.email,
    roleName: member.role.name,
  };
}

export async function createLead(data: CreateLeadDto): Promise<{ id: string }> {
  const ctx = await requireAppContext();
  const authz = createAuthorizationService(ctx.permissions);
  await authz.require(Permissions.LEAD_CREATE);

  let payload: CreateLeadDto = { ...data };

  if (!(await authz.can(Permissions.LEAD_ASSIGN))) {
    payload = {
      ...payload,
      assignedMemberId: ctx.member.id,
      assignedManagerId: undefined,
    };
  } else {
    await assertAssigneeRole(
      ctx.organization.id,
      emptyToNull(payload.assignedMemberId),
      MEMBER_ASSIGNEE_ROLES,
      "Assigned member",
    );
    await assertAssigneeRole(
      ctx.organization.id,
      emptyToNull(payload.assignedManagerId),
      MANAGER_ASSIGNEE_ROLES,
      "Assigned manager",
    );
  }

  if (!payload.statusId) {
    const defaultStatus = await getDefaultStatus(prisma, ctx.organization.id);
    if (!defaultStatus) {
      throw validationFailed("No default status found and no status provided.");
    }
    payload = { ...payload, statusId: defaultStatus.id };
  }

  const isDuplicate = await resolveIsDuplicate(
    ctx.organization.id,
    payload.email,
    payload.phone,
  );

  const customValueRows = await normalizeCustomValuesForOrganization(
    ctx.organization.id,
    payload.customValues,
    { activeOnly: true, requireAllRequired: true },
  );

  const { customValues: _ignored, ...leadPayload } = payload;

  const lead = await prisma.$transaction(async (tx) => {
    const created = await createLeadRecord(
      tx,
      ctx.organization.id,
      ctx.member.id,
      { ...leadPayload, isDuplicate },
    );
    await replaceLeadCustomValues(tx, created.id, customValueRows);
    return created;
  });

  return { id: lead.id };
}

export async function updateLead(
  leadId: string,
  data: UpdateLeadDto,
): Promise<void> {
  const ctx = await requireAppContext();
  const authz = createAuthorizationService(ctx.permissions);
  await authz.require(Permissions.LEAD_UPDATE);

  const lead = await findLeadById(prisma, leadId, ctx.organization.id);
  if (!lead) {
    throw notFound("Lead not found.");
  }

  assertLeadVisible(lead, ctx.member.roleName, ctx.member.id);

  const canAssign = await authz.can(Permissions.LEAD_ASSIGN);
  if (!canAssign && !canEditWithoutAssign(ctx.member.id, lead)) {
    throw permissionDenied();
  }

  let payload: UpdateLeadDto = { ...data };

  if (!canAssign) {
    assertLimitedUpdatePayload(payload);
    payload = {
      statusId: payload.statusId,
      description: payload.description,
    };
  } else {
    if (payload.assignedMemberId !== undefined) {
      await assertAssigneeRole(
        ctx.organization.id,
        emptyToNull(payload.assignedMemberId),
        MEMBER_ASSIGNEE_ROLES,
        "Assigned member",
      );
    }
    if (payload.assignedManagerId !== undefined) {
      await assertAssigneeRole(
        ctx.organization.id,
        emptyToNull(payload.assignedManagerId),
        MANAGER_ASSIGNEE_ROLES,
        "Assigned manager",
      );
    }
  }

  const nextEmail =
    payload.email !== undefined ? payload.email : (lead.email ?? undefined);
  const nextPhone =
    payload.phone !== undefined ? payload.phone : (lead.phone ?? undefined);

  const isDuplicate = canAssign
    ? await resolveIsDuplicate(
        ctx.organization.id,
        nextEmail,
        nextPhone,
        leadId,
      )
    : lead.isDuplicate;

  const { customValues, ...leadFields } = payload;

  let customValueRows:
    | Array<{ fieldId: string; value: Prisma.InputJsonValue }>
    | undefined;

  if (canAssign && customValues !== undefined) {
    customValueRows = await normalizeCustomValuesForOrganization(
      ctx.organization.id,
      customValues,
      { activeOnly: true, requireAllRequired: false },
    );
  }

  await prisma.$transaction(async (tx) => {
    await updateLeadRecord(tx, leadId, ctx.member.id, {
      ...leadFields,
      ...(canAssign ? { isDuplicate } : {}),
    });
    if (customValueRows) {
      await replaceLeadCustomValues(tx, leadId, customValueRows);
    }
  });
}

export async function assignLead(
  leadId: string,
  data: AssignLeadDto,
): Promise<LeadDetailDto> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.LEAD_ASSIGN,
  );

  const lead = await findLeadById(prisma, leadId, ctx.organization.id);
  if (!lead) {
    throw notFound("Lead not found.");
  }

  assertLeadVisible(lead, ctx.member.roleName, ctx.member.id);

  const assignedMemberId =
    data.assignedMemberId === undefined
      ? undefined
      : data.assignedMemberId === null
        ? ""
        : data.assignedMemberId;
  const assignedManagerId =
    data.assignedManagerId === undefined
      ? undefined
      : data.assignedManagerId === null
        ? ""
        : data.assignedManagerId;

  if (assignedMemberId !== undefined) {
    await assertAssigneeRole(
      ctx.organization.id,
      emptyToNull(assignedMemberId),
      MEMBER_ASSIGNEE_ROLES,
      "Assigned member",
    );
  }
  if (assignedManagerId !== undefined) {
    await assertAssigneeRole(
      ctx.organization.id,
      emptyToNull(assignedManagerId),
      MANAGER_ASSIGNEE_ROLES,
      "Assigned manager",
    );
  }

  await updateLeadRecord(prisma, leadId, ctx.member.id, {
    assignedMemberId,
    assignedManagerId,
  });

  const updated = await findLeadById(prisma, leadId, ctx.organization.id);
  if (!updated) {
    throw notFound("Lead not found.");
  }
  const customValues = await getLeadCustomValues(leadId);
  return toLeadDetailDto(updated, customValues);
}

export async function getLead(leadId: string): Promise<LeadDetailDto> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.LEAD_READ,
  );

  const lead = await findLeadById(prisma, leadId, ctx.organization.id);
  if (!lead) {
    throw notFound("Lead not found.");
  }

  assertLeadVisible(lead, ctx.member.roleName, ctx.member.id);

  const customValues = await getLeadCustomValues(leadId);
  return toLeadDetailDto(lead, customValues);
}

export async function getLeads(
  filters: Partial<LeadListFilters> = {},
): Promise<LeadListResultDto> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.LEAD_READ,
  );

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 25;
  const sort = filters.sort ?? "updatedAt";
  const order = filters.order ?? "desc";
  const where = mergeLeadListWhere(
    buildListWhere(filters),
    buildLeadVisibilityWhere(ctx.member.roleName, ctx.member.id),
  );
  const skip = (page - 1) * limit;

  const [leads, count] = await Promise.all([
    findManyLeads(prisma, ctx.organization.id, {
      where,
      skip,
      take: limit,
      orderBy: buildListOrderBy(sort, order),
    }),
    countLeads(prisma, ctx.organization.id, where),
  ]);

  const totalPages = Math.max(1, Math.ceil(count / limit));

  return {
    leads: leads.map(toLeadListItemDto),
    count,
    page,
    limit,
    totalPages,
    sort,
    order,
  };
}

export async function deleteLead(leadId: string): Promise<void> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.LEAD_DELETE,
  );

  const lead = await findLeadById(prisma, leadId, ctx.organization.id);
  if (!lead) {
    throw notFound("Lead not found.");
  }

  assertLeadVisible(lead, ctx.member.roleName, ctx.member.id);

  await softDeleteLead(prisma, leadId, ctx.member.id);
}

export async function listLeadStatuses(): Promise<LeadStatusDto[]> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.LEAD_READ,
  );

  const statuses = await getStatusRecords(prisma, ctx.organization.id);
  return statuses.flatMap((status) => {
    const dto = toStatusDto(status);
    return dto ? [dto] : [];
  });
}

export async function listLeadSources(): Promise<LeadSourceDto[]> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.LEAD_READ,
  );

  const sources = await getSourceRecords(prisma, ctx.organization.id);
  return sources.flatMap((source) => {
    const dto = toSourceDto(source);
    return dto ? [dto] : [];
  });
}

export async function listMemberAssigneeOptions(): Promise<
  LeadAssigneeOptionDto[]
> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.LEAD_READ,
  );

  const members = await listMembersByOrganization(prisma, ctx.organization.id);
  return members
    .filter((member) => MEMBER_ASSIGNEE_ROLES.has(member.role.name))
    .map(toAssigneeOption);
}

export async function listManagerAssigneeOptions(): Promise<
  LeadAssigneeOptionDto[]
> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.LEAD_READ,
  );

  const members = await listMembersByOrganization(prisma, ctx.organization.id);
  return members
    .filter((member) => MANAGER_ASSIGNEE_ROLES.has(member.role.name))
    .map(toAssigneeOption);
}

export async function getLeadCapabilities() {
  const ctx = await requireAppContext();
  const authz = createAuthorizationService(ctx.permissions);
  const canAssign = await authz.can(Permissions.LEAD_ASSIGN);
  return {
    canCreate: await authz.can(Permissions.LEAD_CREATE),
    canUpdate: await authz.can(Permissions.LEAD_UPDATE),
    canEditFull: canAssign,
    canAssign,
    canDelete: await authz.can(Permissions.LEAD_DELETE),
  };
}

export { MANAGER_ASSIGNEE_ROLES, MEMBER_ASSIGNEE_ROLES, canEditWithoutAssign };
