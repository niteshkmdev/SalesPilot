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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LeadDetailDto, LeadStatusDto } from "@/modules/leads";

interface UpdateLeadStatusDialogProps {
  lead: LeadDetailDto;
  statuses: LeadStatusDto[];
  trigger: ReactNode;
}

export function UpdateLeadStatusDialog({
  lead,
  statuses,
  trigger,
}: UpdateLeadStatusDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusId, setStatusId] = useState(lead.statusId);

  const handleSave = async () => {
    if (!statusId) {
      toast.error("Select a status.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await updateLeadAction(lead.id, { statusId });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Status updated");
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
        if (next) setStatusId(lead.statusId);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update status</DialogTitle>
          <DialogDescription>
            Change pipeline status for {lead.firstName} {lead.lastName}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <Label htmlFor="update-status">Status</Label>
          <Select
            value={statusId}
            onValueChange={setStatusId}
            disabled={isLoading || statuses.length === 0}
          >
            <SelectTrigger id="update-status" className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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
            {isLoading ? "Saving..." : "Save status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
