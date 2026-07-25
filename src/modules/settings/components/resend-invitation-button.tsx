"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { resendInvitationAction } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResendInvitationButtonProps {
  invitationId: string;
  email: string;
}

export function ResendInvitationButton({
  invitationId,
  email,
}: ResendInvitationButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const result = await resendInvitationAction(invitationId);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Invitation resent");
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
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Resend
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resend invitation?</DialogTitle>
            <DialogDescription>
              A new invite link will be emailed to{" "}
              <span className="font-medium text-foreground">{email}</span>. The
              previous link will no longer work.
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
            <Button type="button" onClick={handleResend} disabled={isLoading}>
              {isLoading ? "Sending..." : "Resend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
