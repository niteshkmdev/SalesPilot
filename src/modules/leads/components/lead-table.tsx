"use client";

import { formatDistanceToNow } from "date-fns";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  assignLeadAction,
  updateLeadAction,
} from "@/app/(dashboard)/leads/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  LeadAssigneeOptionDto,
  LeadListItemDto,
  LeadStatusDto,
} from "@/modules/leads";
import { DeleteLeadButton } from "@/modules/leads/components/delete-lead-button";

type SortField = "createdAt" | "updatedAt" | "firstName" | "company";

interface LeadCapabilities {
  canUpdate: boolean;
  canEditFull: boolean;
  canAssign: boolean;
  canDelete: boolean;
}

interface LeadTableProps {
  leads: LeadListItemDto[];
  emptyVariant: "none" | "filtered";
  sort: SortField;
  order: "asc" | "desc";
  query: Record<string, string | undefined>;
  statuses: LeadStatusDto[];
  memberOptions: LeadAssigneeOptionDto[];
  managerOptions: LeadAssigneeOptionDto[];
  capabilities: LeadCapabilities;
  currentMemberId: string;
}

function buildSortHref(
  query: Record<string, string | undefined>,
  field: SortField,
  currentSort: SortField,
  currentOrder: "asc" | "desc",
): string {
  const nextOrder =
    currentSort === field && currentOrder === "asc" ? "desc" : "asc";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value && key !== "sort" && key !== "order" && key !== "page") {
      params.set(key, value);
    }
  }
  params.set("sort", field);
  params.set("order", currentSort === field ? nextOrder : "asc");
  params.set("page", "1");
  return `/leads?${params.toString()}`;
}

function SortHeader({
  label,
  field,
  sort,
  order,
  query,
}: {
  label: string;
  field: SortField;
  sort: SortField;
  order: "asc" | "desc";
  query: Record<string, string | undefined>;
}) {
  const active = sort === field;
  return (
    <TableHead>
      <Link
        href={buildSortHref(query, field, sort, order)}
        className="inline-flex items-center gap-1 hover:underline"
        aria-sort={
          active ? (order === "asc" ? "ascending" : "descending") : "none"
        }
      >
        {label}
        {active ? (
          <span className="text-xs text-muted-foreground" aria-hidden>
            {order === "asc" ? "↑" : "↓"}
          </span>
        ) : null}
      </Link>
    </TableHead>
  );
}

function canEditStatus(
  lead: LeadListItemDto,
  capabilities: LeadCapabilities,
  currentMemberId: string,
): boolean {
  if (!capabilities.canUpdate) return false;
  if (capabilities.canAssign) return true;
  return lead.assignedMemberId === currentMemberId;
}

function StatusBadge({ status }: { status: LeadStatusDto }) {
  return (
    <Badge
      variant="outline"
      style={{
        backgroundColor: `${status.color}20`,
        color: status.color,
        borderColor: status.color,
      }}
    >
      {status.name}
    </Badge>
  );
}

export function LeadTable({
  leads,
  emptyVariant,
  sort,
  order,
  query,
  statuses,
  memberOptions,
  managerOptions,
  capabilities,
  currentMemberId,
}: LeadTableProps) {
  const router = useRouter();
  const [rows, setRows] = useState(leads);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setRows(leads);
  }, [leads]);

  const setPending = (leadId: string, pending: boolean) => {
    setPendingIds((current) => {
      const next = new Set(current);
      if (pending) next.add(leadId);
      else next.delete(leadId);
      return next;
    });
  };

  const onStatusChange = async (leadId: string, statusId: string) => {
    const previous = rows.find((row) => row.id === leadId);
    if (!previous) return;
    const nextStatus =
      statuses.find((status) => status.id === statusId) ?? null;

    setRows((current) =>
      current.map((row) =>
        row.id === leadId ? { ...row, status: nextStatus } : row,
      ),
    );
    setPending(leadId, true);

    const result = await updateLeadAction(leadId, { statusId });
    setPending(leadId, false);

    if ("error" in result) {
      setRows((current) =>
        current.map((row) => (row.id === leadId ? previous : row)),
      );
      toast.error(result.error);
      return;
    }

    router.refresh();
  };

  const onMemberAssigneeChange = async (leadId: string, memberId: string) => {
    const previous = rows.find((row) => row.id === leadId);
    if (!previous) return;

    const assignedMemberId = memberId === "none" ? null : memberId;
    const assignedMember = assignedMemberId
      ? (() => {
          const member = memberOptions.find(
            (item) => item.id === assignedMemberId,
          );
          return member
            ? { id: member.id, name: member.name }
            : previous.assignedMember;
        })()
      : null;

    setRows((current) =>
      current.map((row) =>
        row.id === leadId
          ? {
              ...row,
              assignedMember,
              assignedMemberId,
            }
          : row,
      ),
    );
    setPending(leadId, true);

    const result = await assignLeadAction(leadId, {
      assignedMemberId,
    });
    setPending(leadId, false);

    if ("error" in result) {
      setRows((current) =>
        current.map((row) => (row.id === leadId ? previous : row)),
      );
      toast.error(result.error);
      return;
    }

    router.refresh();
  };

  const onManagerAssigneeChange = async (leadId: string, memberId: string) => {
    const previous = rows.find((row) => row.id === leadId);
    if (!previous) return;

    const assignedManagerId = memberId === "none" ? null : memberId;
    const assignedManager = assignedManagerId
      ? (() => {
          const member = managerOptions.find(
            (item) => item.id === assignedManagerId,
          );
          return member
            ? { id: member.id, name: member.name }
            : previous.assignedManager;
        })()
      : null;

    setRows((current) =>
      current.map((row) =>
        row.id === leadId
          ? {
              ...row,
              assignedManager,
              assignedManagerId,
            }
          : row,
      ),
    );
    setPending(leadId, true);

    const result = await assignLeadAction(leadId, {
      assignedManagerId,
    });
    setPending(leadId, false);

    if ("error" in result) {
      setRows((current) =>
        current.map((row) => (row.id === leadId ? previous : row)),
      );
      toast.error(result.error);
      return;
    }

    router.refresh();
  };

  if (!rows.length) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed bg-card">
        <div className="flex flex-col items-center gap-1 px-6 text-center">
          {emptyVariant === "none" ? (
            <>
              <p className="text-sm font-medium">No leads yet.</p>
              <p className="text-sm text-muted-foreground">
                Create your first lead.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium">No matching leads found.</p>
              <p className="text-sm text-muted-foreground">
                No leads match the selected filters.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  const showActions = capabilities.canEditFull || capabilities.canDelete;

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <SortHeader
              label="Name"
              field="firstName"
              sort={sort}
              order={order}
              query={query}
            />
            <SortHeader
              label="Company"
              field="company"
              sort={sort}
              order={order}
              query={query}
            />
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Assigned manager</TableHead>
            <TableHead>Assigned member</TableHead>
            <SortHeader
              label="Updated"
              field="updatedAt"
              sort={sort}
              order={order}
              query={query}
            />
            {showActions ? (
              <TableHead className="w-[88px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((lead) => {
            const pending = pendingIds.has(lead.id);
            const statusEditable = canEditStatus(
              lead,
              capabilities,
              currentMemberId,
            );
            const assigneeEditable = capabilities.canAssign;

            return (
              <TableRow
                key={lead.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/leads/${lead.id}`)}
              >
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">
                      {lead.firstName} {lead.lastName}
                    </span>
                    {lead.email ? (
                      <span className="text-xs text-muted-foreground">
                        {lead.email}
                      </span>
                    ) : null}
                    {lead.isDuplicate ? (
                      <Badge variant="secondary" className="w-fit text-xs">
                        Duplicate
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{lead.company || "—"}</TableCell>
                <TableCell
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  {statusEditable ? (
                    <Select
                      value={lead.status?.id ?? ""}
                      disabled={pending || statuses.length === 0}
                      onValueChange={(statusId) =>
                        onStatusChange(lead.id, statusId)
                      }
                    >
                      <SelectTrigger className="h-8 w-[9.5rem]">
                        <SelectValue placeholder="Status">
                          {lead.status ? (
                            <StatusBadge status={lead.status} />
                          ) : (
                            "—"
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {statuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : lead.status ? (
                    <StatusBadge status={lead.status} />
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>{lead.source?.name || "—"}</TableCell>
                <TableCell
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  {assigneeEditable ? (
                    <Select
                      value={lead.assignedManagerId ?? "none"}
                      disabled={pending}
                      onValueChange={(memberId) =>
                        onManagerAssigneeChange(lead.id, memberId)
                      }
                    >
                      <SelectTrigger className="h-8 w-[10rem]">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="none">Unassigned</SelectItem>
                          {managerOptions.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : (
                    lead.assignedManager?.name || "Unassigned"
                  )}
                </TableCell>
                <TableCell
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  {assigneeEditable ? (
                    <Select
                      value={lead.assignedMemberId ?? "none"}
                      disabled={pending}
                      onValueChange={(memberId) =>
                        onMemberAssigneeChange(lead.id, memberId)
                      }
                    >
                      <SelectTrigger className="h-8 w-[10rem]">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="none">Unassigned</SelectItem>
                          {memberOptions.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : (
                    lead.assignedMember?.name || "Unassigned"
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(
                    new Date(lead.updatedAt || lead.createdAt),
                    { addSuffix: true },
                  )}
                </TableCell>
                {showActions ? (
                  <TableCell
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {capabilities.canEditFull ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${lead.firstName} ${lead.lastName}`}
                          asChild
                        >
                          <Link href={`/leads/${lead.id}/edit`}>
                            <Pencil />
                          </Link>
                        </Button>
                      ) : null}
                      {capabilities.canDelete ? (
                        <DeleteLeadButton
                          leadId={lead.id}
                          leadName={`${lead.firstName} ${lead.lastName}`}
                          variant="icon"
                          redirectToList={false}
                        />
                      ) : null}
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
