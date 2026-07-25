import { PageHeader } from "@/components/layout/page-header";
import { listActiveCustomFieldsForLeads } from "@/modules/custom-fields";
import {
  getLeadCapabilities,
  listLeadSources,
  listLeadStatuses,
  listManagerAssigneeOptions,
  listMemberAssigneeOptions,
} from "@/modules/leads";
import { LeadForm } from "@/modules/leads/components/lead-form";

export default async function NewLeadPage() {
  const [
    statuses,
    sources,
    memberOptions,
    managerOptions,
    capabilities,
    customFields,
  ] = await Promise.all([
    listLeadStatuses(),
    listLeadSources(),
    listMemberAssigneeOptions(),
    listManagerAssigneeOptions(),
    getLeadCapabilities(),
    listActiveCustomFieldsForLeads(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        backHref="/leads"
        title="New lead"
        subtitle="Add a lead to your pipeline"
      />

      <LeadForm
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
