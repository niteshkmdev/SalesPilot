"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  archiveLeadFormAction,
  publishLeadFormAction,
  unarchiveLeadFormAction,
} from "@/app/(dashboard)/forms/actions";
import { Button } from "@/components/ui/button";

interface FormStatusActionsProps {
  formId: string;
  status: string;
  canPublish: boolean;
  canArchive: boolean;
}

export function FormStatusActions({
  formId,
  status,
  canPublish,
  canArchive,
}: FormStatusActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (status === "ARCHIVED") {
    if (!canArchive) return null;
    return (
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const result = await unarchiveLeadFormAction(formId);
            if ("error" in result) {
              toast.error(result.error);
              return;
            }
            toast.success("Form restored to draft");
            router.refresh();
          });
        }}
      >
        Unarchive
      </Button>
    );
  }

  return (
    <>
      {canPublish && status !== "PUBLISHED" ? (
        <Button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const result = await publishLeadFormAction(formId);
              if ("error" in result) {
                toast.error(result.error);
                return;
              }
              toast.success("Form published");
              router.refresh();
            });
          }}
        >
          Publish
        </Button>
      ) : null}
      {canArchive ? (
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const result = await archiveLeadFormAction(formId);
              if ("error" in result) {
                toast.error(result.error);
                return;
              }
              toast.success("Form archived");
              router.refresh();
            });
          }}
        >
          Archive
        </Button>
      ) : null}
    </>
  );
}
