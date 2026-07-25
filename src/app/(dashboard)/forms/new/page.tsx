import { redirect } from "next/navigation";
import { listActiveCustomFieldsForLeads } from "@/modules/custom-fields";
import { getFormCapabilities } from "@/modules/lead-forms";
import { LeadFormEditor } from "@/modules/lead-forms/components/lead-form-editor";
import { listManagerAssigneeOptions } from "@/modules/leads";

export default async function NewFormPage() {
  const [capabilities, customFields, managerOptions] = await Promise.all([
    getFormCapabilities(),
    listActiveCustomFieldsForLeads(),
    listManagerAssigneeOptions(),
  ]);

  if (!capabilities.canCreate) {
    redirect("/forms");
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New form</h1>
        <p className="text-muted-foreground">
          Configure fields and publishing settings.
        </p>
      </div>
      <LeadFormEditor
        customFields={customFields}
        managerOptions={managerOptions}
        canUpdate
        canPublish={false}
        canArchive={false}
      />
    </div>
  );
}
