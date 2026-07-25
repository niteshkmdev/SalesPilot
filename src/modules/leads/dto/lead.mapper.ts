import type {
  Lead,
  OrganizationLeadSource,
  OrganizationLeadStatus,
  User,
} from "@prisma/client";
import {
  type LeadDetailDto,
  type LeadListItemDto,
  type LeadSourceDto,
  type LeadStatusDto,
  resolveStatusColor,
} from "@/modules/leads/dto/lead.dto";

type LeadWithRelations = Lead & {
  status: OrganizationLeadStatus | null;
  source: OrganizationLeadSource | null;
  assignedMember: { id: string; user: Pick<User, "name"> } | null;
  assignedManager?: { id: string; user: Pick<User, "name"> } | null;
};

export function toStatusDto(
  status: OrganizationLeadStatus | null | undefined,
): LeadStatusDto | null {
  if (!status) return null;
  return {
    id: status.id,
    name: status.name,
    color: resolveStatusColor(status.color),
    isDefault: status.isDefault,
  };
}

export function toSourceDto(
  source: OrganizationLeadSource | null | undefined,
): LeadSourceDto | null {
  if (!source) return null;
  return { id: source.id, name: source.name };
}

export function toLeadListItemDto(lead: LeadWithRelations): LeadListItemDto {
  return {
    id: lead.id,
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    jobTitle: lead.jobTitle,
    status: toStatusDto(lead.status),
    source: toSourceDto(lead.source),
    assignedMember: lead.assignedMember
      ? { id: lead.assignedMember.id, name: lead.assignedMember.user.name }
      : null,
    assignedMemberId: lead.assignedMemberId,
    assignedManager: lead.assignedManager
      ? { id: lead.assignedManager.id, name: lead.assignedManager.user.name }
      : null,
    assignedManagerId: lead.assignedManagerId,
    createdBy: lead.createdBy,
    isDuplicate: lead.isDuplicate,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

export function toLeadDetailDto(
  lead: LeadWithRelations,
  customValues: LeadDetailDto["customValues"] = [],
): LeadDetailDto {
  return {
    ...toLeadListItemDto(lead),
    organizationId: lead.organizationId,
    statusId: lead.statusId,
    sourceId: lead.sourceId,
    website: lead.website,
    description: lead.description,
    customValues,
  };
}
