import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { requireAppContext } from "@/modules/auth/services/app-context.service";
import { listActiveCustomFieldsForLeads } from "@/modules/custom-fields";
import { getFormCapabilities } from "@/modules/lead-forms";
import { LeadFormEditor } from "@/modules/lead-forms/components/lead-form-editor";
import { listManagerAssigneeOptions } from "@/modules/leads";

export default async function NewFormPage() {
  const [ctx, capabilities, customFields, managerOptions] = await Promise.all([
    requireAppContext(),
    getFormCapabilities(),
    listActiveCustomFieldsForLeads(),
    listManagerAssigneeOptions(),
  ]);

  if (!capabilities.canCreate) {
    redirect("/forms");
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        backHref="/forms"
        backLabel="Back to forms"
        title="New form"
        subtitle="Configure fields and publishing settings."
      />
      <LeadFormEditor
        customFields={customFields}
        managerOptions={managerOptions}
        canUpdate
        canPublish={capabilities.canPublish}
        canArchive={false}
        organizationLogo={ctx.organization.logo}
      />
    </div>
  );
}
