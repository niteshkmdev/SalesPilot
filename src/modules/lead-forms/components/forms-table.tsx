"use client";

import { Copy, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { softDeleteLeadFormAction } from "@/app/(dashboard)/forms/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LeadFormListItemDto } from "@/modules/lead-forms/dto/lead-form.dto";

interface FormsTableProps {
  forms: LeadFormListItemDto[];
  emptyVariant: "none" | "filtered";
  canUpdate?: boolean;
  canDelete?: boolean;
}

export function FormsTable({
  forms,
  emptyVariant,
  canUpdate = false,
  canDelete = false,
}: FormsTableProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<LeadFormListItemDto | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  if (forms.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        {emptyVariant === "filtered"
          ? "No forms match your filters."
          : "No forms yet. Create one to start collecting leads."}
      </p>
    );
  }

  const copyLink = async (publicPath: string) => {
    const url = `${window.location.origin}${publicPath}`;
    await navigator.clipboard.writeText(url);
    toast.success("Public URL copied");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await softDeleteLeadFormAction(deleteTarget.id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Form deleted");
      setDeleteTarget(null);
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form) => (
              <TableRow
                key={form.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/forms/view/${form.id}`)}
              >
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
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={form.status !== "PUBLISHED"}
                      aria-label="Copy public link"
                      title={
                        form.status === "PUBLISHED"
                          ? "Copy public link"
                          : "Publish the form to share a link"
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                        void copyLink(form.publicPath);
                      }}
                    >
                      <Copy />
                    </Button>
                    {canUpdate && form.status !== "ARCHIVED" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${form.name}`}
                        asChild
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Link href={`/forms/edit/${form.id}`}>
                          <Pencil />
                        </Link>
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Delete ${form.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeleteTarget(form);
                        }}
                      >
                        <Trash2 />
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Delete form?</DialogTitle>
            <DialogDescription>
              This hides
              {deleteTarget ? (
                <>
                  {" "}
                  <span className="font-medium text-foreground">
                    {deleteTarget.name}
                  </span>
                </>
              ) : (
                " the form"
              )}{" "}
              from your workspace. Public submissions stop once it is removed
              from the list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
