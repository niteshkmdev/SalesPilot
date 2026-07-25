import type { Prisma } from "@prisma/client";
import { systemRoleNames } from "@/modules/organizations/constants/default-roles";
import { notFound } from "@/shared/api/errors";

const ORG_WIDE_LEAD_ROLES = new Set<string>([
  systemRoleNames.owner,
  systemRoleNames.admin,
]);

export function isOrgWideLeadRole(roleName: string): boolean {
  return ORG_WIDE_LEAD_ROLES.has(roleName);
}

/**
 * Role-scoped lead visibility (docs/13-leads.md):
 * - Owner/Admin: all org leads (null = no extra filter)
 * - Manager: assigned as member OR manager
 * - Member (and any other role): assigned as member only
 */
export function buildLeadVisibilityWhere(
  roleName: string,
  memberId: string,
): Prisma.LeadWhereInput | null {
  if (isOrgWideLeadRole(roleName)) {
    return null;
  }

  if (roleName === systemRoleNames.manager) {
    return {
      OR: [{ assignedMemberId: memberId }, { assignedManagerId: memberId }],
    };
  }

  return { assignedMemberId: memberId };
}

export function mergeLeadListWhere(
  filterWhere: Prisma.LeadWhereInput,
  visibilityWhere: Prisma.LeadWhereInput | null,
): Prisma.LeadWhereInput {
  if (!visibilityWhere) {
    return filterWhere;
  }
  if (Object.keys(filterWhere).length === 0) {
    return visibilityWhere;
  }
  return { AND: [filterWhere, visibilityWhere] };
}

export function isLeadVisibleToMember(
  lead: {
    assignedMemberId: string | null;
    assignedManagerId: string | null;
  },
  roleName: string,
  memberId: string,
): boolean {
  if (isOrgWideLeadRole(roleName)) {
    return true;
  }
  if (roleName === systemRoleNames.manager) {
    return (
      lead.assignedMemberId === memberId || lead.assignedManagerId === memberId
    );
  }
  return lead.assignedMemberId === memberId;
}

export function assertLeadVisible(
  lead: {
    assignedMemberId: string | null;
    assignedManagerId: string | null;
  },
  roleName: string,
  memberId: string,
): void {
  if (!isLeadVisibleToMember(lead, roleName, memberId)) {
    throw notFound("Lead not found.");
  }
}

/** Limited writers (no LEAD_ASSIGN) may only touch leads where they are the assigned member. */
export function canEditWithoutAssign(
  memberId: string,
  lead: { assignedMemberId: string | null },
): boolean {
  return lead.assignedMemberId === memberId;
}
