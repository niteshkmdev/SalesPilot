"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteLeadAction } from "@/app/(dashboard)/leads/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteLeadButtonProps {
  leadId: string;
  leadName?: string;
  variant?: "button" | "icon";
  redirectToList?: boolean;
}

export function DeleteLeadButton({
  leadId,
  leadName,
  variant = "button",
  redirectToList = true,
}: DeleteLeadButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteLeadAction(leadId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Lead deleted");
      setOpen(false);
      if (redirectToList) {
        router.push("/leads");
      }
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {variant === "icon" ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={leadName ? `Delete ${leadName}` : "Delete lead"}
          onClick={(event) => {
            event.stopPropagation();
            setOpen(true);
          }}
        >
          <Trash2 />
        </Button>
      ) : (
        <Button
          type="button"
          variant="destructive"
          onClick={() => setOpen(true)}
          disabled={isLoading}
        >
          Delete
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Delete lead?</DialogTitle>
            <DialogDescription>
              This removes
              {leadName ? (
                <>
                  {" "}
                  <span className="font-medium text-foreground">
                    {leadName}
                  </span>
                </>
              ) : (
                " the lead"
              )}{" "}
              from your pipeline and cannot be undone in the app.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
