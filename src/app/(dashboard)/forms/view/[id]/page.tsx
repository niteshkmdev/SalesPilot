import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  coreFieldLabels,
  getFormCapabilities,
  getLeadForm,
} from "@/modules/lead-forms";
import { CopyPublicFormLinkButton } from "@/modules/lead-forms/components/copy-public-form-link-button";
import { FormStatusActions } from "@/modules/lead-forms/components/form-status-actions";
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

export default async function FormDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [form, capabilities] = await Promise.all([
    loadForm(id),
    getFormCapabilities(),
  ]);

  if (!capabilities.canRead) {
    redirect("/dashboard");
  }

  const sortedFields = [...form.fields].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        backHref="/forms"
        backLabel="Back to forms"
        title={form.name}
        subtitle={form.description || "Lead capture form"}
        actions={
          <>
            <Badge variant="secondary">{form.status}</Badge>
            <CopyPublicFormLinkButton
              publicPath={form.publicPath}
              disabled={form.status !== "PUBLISHED"}
            />
            {capabilities.canUpdate ? (
              <Button variant="outline" asChild>
                <Link href={`/forms/edit/${form.id}`}>
                  <Pencil data-icon="inline-start" />
                  Edit
                </Link>
              </Button>
            ) : null}
            <FormStatusActions
              formId={form.id}
              status={form.status}
              canPublish={capabilities.canPublish}
              canArchive={capabilities.canArchive}
            />
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Form identity and sharing.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-4 border-b pb-2">
                <dt className="text-muted-foreground">Slug</dt>
                <dd className="font-medium">{form.slug}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b pb-2">
                <dt className="text-muted-foreground">Public path</dt>
                <dd className="font-medium">{form.publicPath}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b pb-2">
                <dt className="text-muted-foreground">Indexing</dt>
                <dd className="font-medium">
                  {form.allowIndexing ? "Allowed" : "Blocked"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Updated</dt>
                <dd className="font-medium">
                  {new Date(form.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submission settings</CardTitle>
            <CardDescription>
              What happens after a visitor submits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex flex-col gap-1 border-b pb-2">
                <dt className="text-muted-foreground">Success message</dt>
                <dd className="font-medium">
                  {form.successMessage ||
                    "Thank you! Your information has been received."}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Default manager</dt>
                <dd className="font-medium">
                  {form.defaultAssignedManagerId || "Unassigned"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fields</CardTitle>
          <CardDescription>
            Fields shown on the public form, in display order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2 text-sm">
            {sortedFields.map((field) => {
              const label =
                field.kind === "core" && field.coreKey
                  ? coreFieldLabels[field.coreKey]
                  : field.key;
              return (
                <li
                  key={field.key}
                  className="flex items-center justify-between gap-4 border-b pb-2 last:border-0 last:pb-0"
                >
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">
                    {field.required ? "Required" : "Optional"} · {field.kind}
                  </span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
