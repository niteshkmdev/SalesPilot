"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { assignLeadAction } from "@/app/(dashboard)/leads/actions";
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
import type { LeadAssigneeOptionDto, LeadDetailDto } from "@/modules/leads";

interface AssignLeadDialogProps {
  lead: LeadDetailDto;
  memberOptions: LeadAssigneeOptionDto[];
  managerOptions: LeadAssigneeOptionDto[];
}

export function AssignLeadDialog({
  lead,
  memberOptions,
  managerOptions,
}: AssignLeadDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [assignedMemberId, setAssignedMemberId] = useState(
    lead.assignedMemberId ?? "none",
  );
  const [assignedManagerId, setAssignedManagerId] = useState(
    lead.assignedManagerId ?? "none",
  );

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await assignLeadAction(lead.id, {
        assignedMemberId: assignedMemberId === "none" ? null : assignedMemberId,
        assignedManagerId:
          assignedManagerId === "none" ? null : assignedManagerId,
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Assignment updated");
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
        if (next) {
          setAssignedMemberId(lead.assignedMemberId ?? "none");
          setAssignedManagerId(lead.assignedManagerId ?? "none");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Assign</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign lead</DialogTitle>
          <DialogDescription>
            Choose who owns {lead.firstName} {lead.lastName}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="assign-manager">Assigned manager</Label>
            <Select
              value={assignedManagerId}
              onValueChange={setAssignedManagerId}
              disabled={isLoading}
            >
              <SelectTrigger id="assign-manager" className="w-full">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {managerOptions.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="assign-member">Assigned member</Label>
            <Select
              value={assignedMemberId}
              onValueChange={setAssignedMemberId}
              disabled={isLoading}
            >
              <SelectTrigger id="assign-member" className="w-full">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {memberOptions.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
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
            {isLoading ? "Saving..." : "Save assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
