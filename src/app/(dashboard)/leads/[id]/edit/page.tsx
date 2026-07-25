import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { listActiveCustomFieldsForLeads } from "@/modules/custom-fields";
import {
  getLead,
  getLeadCapabilities,
  listLeadSources,
  listLeadStatuses,
  listManagerAssigneeOptions,
  listMemberAssigneeOptions,
} from "@/modules/leads";
import { LeadForm } from "@/modules/leads/components/lead-form";
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

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: leadId } = await params;

  const [
    lead,
    statuses,
    sources,
    memberOptions,
    managerOptions,
    capabilities,
    customFields,
  ] = await Promise.all([
    loadLead(leadId),
    listLeadStatuses(),
    listLeadSources(),
    listMemberAssigneeOptions(),
    listManagerAssigneeOptions(),
    getLeadCapabilities(),
    listActiveCustomFieldsForLeads(),
  ]);

  if (!capabilities.canEditFull) {
    redirect(`/leads/${lead.id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        backHref={`/leads/${lead.id}`}
        backLabel="Back to lead"
        title={`${lead.firstName} ${lead.lastName}`}
        subtitle="Edit lead details"
      />

      <LeadForm
        initialData={lead}
        statuses={statuses}
        sources={sources}
        memberOptions={memberOptions}
        managerOptions={managerOptions}
        canAssign={capabilities.canAssign}
        customFields={customFields}
      />
    </div>
  );
}
