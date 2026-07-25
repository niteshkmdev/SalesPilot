"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { updateLeadAction } from "@/app/(dashboard)/leads/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LeadDetailDto } from "@/modules/leads";

interface UpdateLeadNotesDialogProps {
  lead: LeadDetailDto;
  trigger: ReactNode;
}

export function UpdateLeadNotesDialog({
  lead,
  trigger,
}: UpdateLeadNotesDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState(lead.description ?? "");

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateLeadAction(lead.id, { description });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Notes updated");
      setOpen(false);
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setDescription(lead.description ?? "");
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update notes</DialogTitle>
          <DialogDescription>
            Add context for {lead.firstName} {lead.lastName}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <Label htmlFor="update-notes">Notes</Label>
          <Textarea
            id="update-notes"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={6}
            disabled={isLoading}
            placeholder="Context, next steps, or anything the team should know..."
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save notes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
