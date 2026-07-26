import { requireAppContext } from "@/modules/auth/services/app-context.service";
import type { InvitationDto } from "@/modules/organizations/dto/invitation.dto";
import {
  hasActiveMemberFilters,
  type MemberDto,
  MemberListFiltersSchema,
} from "@/modules/organizations/dto/member.dto";
import { listPendingInvitations } from "@/modules/organizations/services/invitation.service";
import {
  listAssignableRoles,
  listOrganizationMembers,
  listOrganizationRoles,
} from "@/modules/organizations/services/member.service";
import { Permissions } from "@/modules/permissions/constants/permissions";
import { createAuthorizationService } from "@/modules/permissions/services/authorization.service";
import { InviteMemberDialog } from "@/modules/settings/components/invite-member-dialog";
import { MemberFilters } from "@/modules/settings/components/member-filters";
import { MemberSearchToggle } from "@/modules/settings/components/member-search-toggle";
import { MembersTable } from "@/modules/settings/components/members-table";
import { PendingInvitations } from "@/modules/settings/components/pending-invitations";
import { RefreshButton } from "@/components/refresh-button";

function matchesQuery(haystack: string, query: string): boolean {
  return haystack.toLowerCase().includes(query);
}

function filterMembers(
  members: MemberDto[],
  q: string | undefined,
  roleId: string | undefined,
): MemberDto[] {
  const query = q?.trim().toLowerCase();
  return members.filter((member) => {
    if (roleId && member.roleId !== roleId) return false;
    if (!query) return true;
    return (
      matchesQuery(member.name, query) || matchesQuery(member.email, query)
    );
  });
}

function filterInvitations(
  invitations: InvitationDto[],
  q: string | undefined,
  roleId: string | undefined,
): InvitationDto[] {
  const query = q?.trim().toLowerCase();
  return invitations.filter((invitation) => {
    if (roleId && invitation.roleId !== roleId) return false;
    if (!query) return true;
    return matchesQuery(invitation.email, query);
  });
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ctx = await requireAppContext();
  const authz = createAuthorizationService(ctx.permissions);
  const canRead = await authz.can(Permissions.MEMBER_READ);

  if (!canRead) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">
            You do not have permission to view members.
          </p>
        </div>
      </div>
    );
  }

  const raw = await searchParams;
  const pick = (key: string) => {
    const value = raw[key];
    return typeof value === "string" ? value : undefined;
  };

  const filters = MemberListFiltersSchema.parse({
    q: pick("q") || undefined,
    roleId: pick("roleId") || undefined,
  });

  const canInvite = await authz.can(Permissions.MEMBER_INVITE);
  const canManage =
    (await authz.can(Permissions.MEMBER_UPDATE)) ||
    (await authz.can(Permissions.MEMBER_REMOVE));

  const [members, assignableRoles, allRoles, invitations] = await Promise.all([
    listOrganizationMembers(),
    listAssignableRoles(),
    listOrganizationRoles(),
    listPendingInvitations(),
  ]);

  const filteredMembers = filterMembers(members, filters.q, filters.roleId);
  const filteredInvitations = filterInvitations(
    invitations,
    filters.q,
    filters.roleId,
  );
  const memberCount = filteredMembers.length;
  const filtersActive =
    hasActiveMemberFilters(filters) || Boolean(filters.q?.trim());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">
            Manage who has access to your organization. {memberCount} member
            {memberCount === 1 ? "" : "s"}
            {filtersActive ? " matching filters" : ""}.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <MemberSearchToggle initialQuery={filters.q ?? ""} />
          <RefreshButton />
          <MemberFilters
            roles={allRoles}
            q={filters.q}
            roleId={filters.roleId}
          />
          {canInvite ? <InviteMemberDialog roles={assignableRoles} /> : null}
        </div>
      </div>

      <MembersTable
        members={filteredMembers}
        roles={assignableRoles}
        currentMemberId={ctx.member.id}
        canManage={canManage}
        emptyVariant={filtersActive ? "filtered" : "none"}
      />

      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Pending invitations
          </h2>
          <p className="text-sm text-muted-foreground">
            Invites expire after 7 days. Resend to refresh the link.
          </p>
        </div>
        <PendingInvitations
          invitations={filteredInvitations}
          emptyVariant={filtersActive ? "filtered" : "none"}
        />
      </div>
    </div>
  );
}
