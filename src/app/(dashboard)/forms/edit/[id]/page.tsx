import { notFound, redirect } from "next/navigation";
import { listActiveCustomFieldsForLeads } from "@/modules/custom-fields";
import { getFormCapabilities, getLeadForm } from "@/modules/lead-forms";
import { LeadFormEditor } from "@/modules/lead-forms/components/lead-form-editor";
import { listManagerAssigneeOptions } from "@/modules/leads";
import { ApiErrorCode, AppError } from "@/shared/api/errors";

async function loadForm(formId: string) {
  try {
    return await getLeadForm(formId);
  } catch (error) {
    if (error instanceof AppError && error.code === ApiErrorCode.NOT_FOUND) {
      notFound();
    }
    throw error;
  }
}

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [form, capabilities, customFields, managerOptions] = await Promise.all([
    loadForm(id),
    getFormCapabilities(),
    listActiveCustomFieldsForLeads(),
    listManagerAssigneeOptions(),
  ]);

  if (!capabilities.canRead) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{form.name}</h1>
        <p className="text-muted-foreground">Edit form configuration.</p>
      </div>
      <LeadFormEditor
        initialData={form}
        customFields={customFields}
        managerOptions={managerOptions}
        canUpdate={capabilities.canUpdate}
        canPublish={capabilities.canPublish}
        canArchive={capabilities.canArchive}
      />
    </div>
  );
}
