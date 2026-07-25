"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { acceptInvitationAction } from "@/app/(auth)/invite/actions";
import { Button } from "@/components/ui/button";

export function AcceptInviteButton({ token }: { token: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      className="w-full"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await acceptInvitationAction(token);
          if (result && "error" in result && result.error) {
            toast.error(result.error);
          }
        });
      }}
    >
      {pending ? "Joining…" : "Accept invitation"}
    </Button>
  );
}
