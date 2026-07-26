"use client";

import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { inviteMemberAction } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { systemRoleNames } from "@/modules/organizations/constants/default-roles";
import type { RoleOptionDto } from "@/modules/organizations/dto/member.dto";

interface InviteMemberDialogProps {
  roles: RoleOptionDto[];
}

function defaultInviteRoleId(roles: RoleOptionDto[]): string {
  return (
    roles.find((role) => role.name === systemRoleNames.member)?.id ??
    roles[0]?.id ??
    ""
  );
}

export function InviteMemberDialog({ roles }: InviteMemberDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(() => defaultInviteRoleId(roles));
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setRoleId(defaultInviteRoleId(roles));
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    startTransition(async () => {
      try {
        const result = await inviteMemberAction({ email, roleId });
        if ("error" in result && result.error) {
          toast.error(result.error);
          return;
        }
        if ("emailSent" in result && result.emailSent === false) {
          toast.success("Invitation created (email could not be sent)");
        } else {
          toast.success("Invitation sent");
        }
        setEmail("");
        setRoleId(defaultInviteRoleId(roles));
        setOpen(false);
      } catch (_err) {
        toast.error("Failed to invite member");
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button type="button">
          <UserPlus data-icon="inline-start" />
          Invite Member
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Invite member</SheetTitle>
          <SheetDescription>
            Send an email invitation with a role. The link expires in 7 days.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 p-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select value={roleId} onValueChange={setRoleId} required>
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <SheetFooter className="mt-auto px-0">
            <Button type="submit" disabled={isLoading || !roleId}>
              {isLoading ? "Sending…" : "Send invitation"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
