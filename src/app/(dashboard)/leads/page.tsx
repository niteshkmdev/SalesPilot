import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAppContext } from "@/modules/auth/services/app-context.service";
import {
  getLeadCapabilities,
  getLeads,
  hasActiveListFilters,
  isOrgWideLeadRole,
  LeadListFiltersSchema,
  listLeadSources,
  listLeadStatuses,
  listManagerAssigneeOptions,
  listMemberAssigneeOptions,
} from "@/modules/leads";
import { LeadFilters } from "@/modules/leads/components/lead-filters";
import { LeadPagination } from "@/modules/leads/components/lead-pagination";
import { LeadSearchToggle } from "@/modules/leads/components/lead-search-toggle";
import { LeadTable } from "@/modules/leads/components/lead-table";
import { RefreshButton } from "@/components/refresh-button";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ctx = await requireAppContext();
  const canFilterAssignees = isOrgWideLeadRole(ctx.member.roleName);

  const raw = await searchParams;
  const pick = (key: string) => {
    const value = raw[key];
    return typeof value === "string" ? value : undefined;
  };

  const filters = LeadListFiltersSchema.parse({
    q: pick("q") || undefined,
    statusId: pick("statusId") || undefined,
    sourceId: pick("sourceId") || undefined,
    assignedMemberId: canFilterAssignees
      ? pick("assignedMemberId") || undefined
      : undefined,
    assignedManagerId: canFilterAssignees
      ? pick("assignedManagerId") || undefined
      : undefined,
    createdFrom: pick("createdFrom") || undefined,
    createdTo: pick("createdTo") || undefined,
    updatedFrom: pick("updatedFrom") || undefined,
    updatedTo: pick("updatedTo") || undefined,
    isDuplicate: pick("isDuplicate") || undefined,
    page: pick("page") || undefined,
    limit: pick("limit") || undefined,
    sort: pick("sort") || undefined,
    order: pick("order") || undefined,
  });

  const [list, statuses, sources, memberOptions, managerOptions, capabilities] =
    await Promise.all([
      getLeads(filters),
      listLeadStatuses(),
      listLeadSources(),
      listMemberAssigneeOptions(),
      listManagerAssigneeOptions(),
      getLeadCapabilities(),
    ]);

  const queryForLinks: Record<string, string | undefined> = {
    q: filters.q,
    statusId: filters.statusId,
    sourceId: filters.sourceId,
    assignedMemberId: filters.assignedMemberId,
    assignedManagerId: filters.assignedManagerId,
    createdFrom: filters.createdFrom,
    createdTo: filters.createdTo,
    updatedFrom: filters.updatedFrom,
    updatedTo: filters.updatedTo,
    isDuplicate:
      filters.isDuplicate === undefined
        ? undefined
        : filters.isDuplicate
          ? "true"
          : "false",
    sort: filters.sort,
    order: filters.order,
    limit: String(filters.limit),
    page: String(filters.page),
  };

  const emptyVariant = hasActiveListFilters(filters) ? "filtered" : "none";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track your pipeline. {list.count} lead
            {list.count === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <LeadSearchToggle initialQuery={filters.q ?? ""} />
          <RefreshButton />
          <LeadFilters
            statuses={statuses}
            sources={sources}
            memberOptions={memberOptions}
            managerOptions={managerOptions}
            canFilterAssignees={canFilterAssignees}
            q={filters.q}
            statusId={filters.statusId}
            sourceId={filters.sourceId}
            assignedMemberId={filters.assignedMemberId}
            assignedManagerId={filters.assignedManagerId}
            createdFrom={filters.createdFrom}
            createdTo={filters.createdTo}
            updatedFrom={filters.updatedFrom}
            updatedTo={filters.updatedTo}
            isDuplicate={filters.isDuplicate}
            sort={filters.sort}
            order={filters.order}
            limit={filters.limit}
          />
          {capabilities.canCreate ? (
            <Button asChild>
              <Link href="/leads/new">
                <Plus data-icon="inline-start" />
                New Lead
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <LeadTable
        leads={list.leads}
        emptyVariant={emptyVariant}
        sort={list.sort}
        order={list.order}
        query={queryForLinks}
        statuses={statuses}
        memberOptions={memberOptions}
        managerOptions={managerOptions}
        capabilities={{
          canUpdate: capabilities.canUpdate,
          canEditFull: capabilities.canEditFull,
          canAssign: capabilities.canAssign,
          canDelete: capabilities.canDelete,
        }}
        currentMemberId={ctx.member.id}
      />

      <LeadPagination
        page={list.page}
        totalPages={list.totalPages}
        count={list.count}
        limit={list.limit}
        query={queryForLinks}
      />
    </div>
  );
}
