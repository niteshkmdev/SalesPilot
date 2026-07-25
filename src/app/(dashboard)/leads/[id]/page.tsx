import { format } from "date-fns";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAppContext } from "@/modules/auth/services/app-context.service";
import {
  getLead,
  getLeadCapabilities,
  listLeadStatuses,
  listManagerAssigneeOptions,
  listMemberAssigneeOptions,
} from "@/modules/leads";
import { AssignLeadDialog } from "@/modules/leads/components/assign-lead-dialog";
import { DeleteLeadButton } from "@/modules/leads/components/delete-lead-button";
import { LeadPageHeader } from "@/modules/leads/components/lead-page-header";
import { UpdateLeadNotesDialog } from "@/modules/leads/components/update-lead-notes-dialog";
import { UpdateLeadStatusDialog } from "@/modules/leads/components/update-lead-status-dialog";
import { ApiErrorCode, AppError } from "@/shared/api/errors";

async function loadLead(leadId: string) {
  try {
    return await getLead(leadId);
  } catch (error) {
    if (error instanceof AppError && error.code === ApiErrorCode.NOT_FOUND) {
      notFound();
    }
    throw error;
  }
}

function canUpdateOwnedLead(
  canUpdate: boolean,
  canAssign: boolean,
  memberId: string,
  lead: { assignedMemberId: string | null },
): boolean {
  if (!canUpdate) return false;
  if (canAssign) return true;
  return lead.assignedMemberId === memberId;
}

function StatusBadge({ name, color }: { name: string; color: string }) {
  return (
    <Badge
      variant="outline"
      style={{
        backgroundColor: `${color}20`,
        color,
        borderColor: color,
      }}
    >
      {name}
    </Badge>
  );
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: leadId } = await params;
  const ctx = await requireAppContext();

  const [lead, statuses, memberOptions, managerOptions, capabilities] =
    await Promise.all([
      loadLead(leadId),
      listLeadStatuses(),
      listMemberAssigneeOptions(),
      listManagerAssigneeOptions(),
      getLeadCapabilities(),
    ]);

  const canUpdateThisLead = canUpdateOwnedLead(
    capabilities.canUpdate,
    capabilities.canAssign,
    ctx.member.id,
    lead,
  );

  const statusChip =
    lead.status != null ? (
      canUpdateThisLead ? (
        <UpdateLeadStatusDialog
          lead={lead}
          statuses={statuses}
          trigger={
            <button
              type="button"
              aria-label="Update status"
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <StatusBadge name={lead.status.name} color={lead.status.color} />
            </button>
          }
        />
      ) : (
        <StatusBadge name={lead.status.name} color={lead.status.color} />
      )
    ) : null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <LeadPageHeader
        backHref="/leads"
        title={`${lead.firstName} ${lead.lastName}`}
        subtitle={
          [lead.jobTitle, lead.company].filter(Boolean).join(" at ") ||
          "No company details"
        }
        actions={
          <>
            {lead.isDuplicate ? (
              <Badge variant="secondary">Duplicate</Badge>
            ) : null}
            {statusChip}
            {capabilities.canAssign ? (
              <AssignLeadDialog
                lead={lead}
                memberOptions={memberOptions}
                managerOptions={managerOptions}
              />
            ) : null}
            {capabilities.canEditFull ? (
              <Button variant="outline" asChild>
                <Link href={`/leads/${lead.id}/edit`}>
                  <Pencil data-icon="inline-start" />
                  Edit Lead
                </Link>
              </Button>
            ) : null}
            {capabilities.canDelete ? (
              <DeleteLeadButton
                leadId={lead.id}
                leadName={`${lead.firstName} ${lead.lastName}`}
              />
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>How to reach this lead.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-4 border-b pb-2">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{lead.email || "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b pb-2">
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="font-medium">{lead.phone || "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Website</dt>
                <dd className="font-medium">
                  {lead.website ? (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      {lead.website}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
            <CardDescription>Ownership and intake details.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-4 border-b pb-2">
                <dt className="text-muted-foreground">Assigned member</dt>
                <dd className="font-medium">
                  {lead.assignedMember?.name || "Unassigned"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b pb-2">
                <dt className="text-muted-foreground">Assigned manager</dt>
                <dd className="font-medium">
                  {lead.assignedManager?.name || "Unassigned"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b pb-2">
                <dt className="text-muted-foreground">Source</dt>
                <dd className="font-medium">{lead.source?.name || "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b pb-2">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium">
                  {format(new Date(lead.createdAt), "PPP")}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Updated</dt>
                <dd className="font-medium">
                  {format(new Date(lead.updatedAt || lead.createdAt), "PPP")}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="flex flex-col gap-1.5">
            <CardTitle>Notes</CardTitle>
            <CardDescription>Context for the team.</CardDescription>
          </div>
          {canUpdateThisLead ? (
            <UpdateLeadNotesDialog
              lead={lead}
              trigger={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Edit notes"
                >
                  <Pencil />
                </Button>
              }
            />
          ) : null}
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {lead.description || "No notes yet for this lead."}
          </p>
        </CardContent>
      </Card>

      {lead.customValues.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Custom fields</CardTitle>
            <CardDescription>
              Organization-specific values for this lead.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-3 text-sm">
              {lead.customValues.map((entry, index) => (
                <div
                  key={entry.fieldId}
                  className={`flex items-center justify-between gap-4 ${
                    index < lead.customValues.length - 1 ? "border-b pb-2" : ""
                  }`}
                >
                  <dt className="text-muted-foreground">{entry.name}</dt>
                  <dd className="font-medium">
                    {entry.value === null || entry.value === undefined
                      ? "—"
                      : String(entry.value)}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
