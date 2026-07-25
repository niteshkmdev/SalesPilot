import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  getFormCapabilities,
  listOrganizationLeadForms,
} from "@/modules/lead-forms";
import { FormFilters } from "@/modules/lead-forms/components/form-filters";
import { FormSearchToggle } from "@/modules/lead-forms/components/form-search-toggle";
import { FormsTable } from "@/modules/lead-forms/components/forms-table";

const statusValues = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export default async function FormsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const capabilities = await getFormCapabilities();
  if (!capabilities.canRead) {
    redirect("/dashboard");
  }

  const raw = await searchParams;
  const pick = (key: string) => {
    const value = raw[key];
    return typeof value === "string" ? value : undefined;
  };

  const q = pick("q") || undefined;
  const statusRaw = pick("status");
  const status = statusValues.includes(
    statusRaw as (typeof statusValues)[number],
  )
    ? (statusRaw as (typeof statusValues)[number])
    : undefined;

  const forms = await listOrganizationLeadForms({ q, status });
  const emptyVariant = q || status ? "filtered" : "none";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forms</h1>
          <p className="text-muted-foreground">
            Public forms that capture leads into your pipeline. {forms.length}{" "}
            form{forms.length === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <FormSearchToggle initialQuery={q ?? ""} />
          <FormFilters q={q} status={status} />
          {capabilities.canCreate ? (
            <Button asChild>
              <Link href="/forms/new">
                <Plus data-icon="inline-start" />
                New form
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <FormsTable
        forms={forms}
        emptyVariant={emptyVariant}
        canUpdate={capabilities.canUpdate}
        canDelete={capabilities.canDelete}
      />
    </div>
  );
}
