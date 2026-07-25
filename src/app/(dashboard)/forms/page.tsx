import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getFormCapabilities,
  listOrganizationLeadForms,
} from "@/modules/lead-forms";

export default async function FormsListPage() {
  const capabilities = await getFormCapabilities();
  if (!capabilities.canRead) {
    redirect("/dashboard");
  }

  const forms = await listOrganizationLeadForms();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Forms</h1>
          <p className="text-muted-foreground">
            Create public forms that capture leads into your pipeline.
          </p>
        </div>
        {capabilities.canCreate ? (
          <Button asChild>
            <Link href="/forms/new">New form</Link>
          </Button>
        ) : null}
      </div>

      {forms.length === 0 ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No forms yet.
          {capabilities.canCreate
            ? " Create one to start collecting leads."
            : ""}
        </p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell className="font-medium">{form.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {form.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{form.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(form.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/forms/edit/${form.id}`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
