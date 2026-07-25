"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateMemberRoleAction } from "@/app/(dashboard)/settings/actions";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  MemberDto,
  RoleOptionDto,
} from "@/modules/organizations/dto/member.dto";
import { RemoveMemberButton } from "@/modules/settings/components/remove-member-button";

interface MembersTableProps {
  members: MemberDto[];
  roles: RoleOptionDto[];
  currentMemberId: string;
  canManage: boolean;
  emptyVariant?: "none" | "filtered";
}

export function MembersTable({
  members,
  roles,
  currentMemberId,
  canManage,
  emptyVariant = "none",
}: MembersTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onRoleChange = (memberId: string, roleId: string) => {
    startTransition(async () => {
      const result = await updateMemberRoleAction(memberId, roleId);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Role updated");
      router.refresh();
    });
  };

  if (!members.length) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed bg-card">
        <div className="flex flex-col items-center gap-1 px-6 text-center">
          <p className="text-sm font-medium">
            {emptyVariant === "filtered"
              ? "No members match your filters"
              : "No members found"}
          </p>
          <p className="text-sm text-muted-foreground">
            {emptyVariant === "filtered"
              ? "Try clearing search or role filters."
              : "Invite a teammate to get started."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            {canManage ? <TableHead className="w-14" /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isSelf = member.id === currentMemberId;
            const locked = member.isOwner;
            return (
              <TableRow key={member.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {member.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {canManage && !locked ? (
                    <Select
                      value={member.roleId}
                      disabled={pending}
                      onValueChange={(roleId) =>
                        onRoleChange(member.id, roleId)
                      }
                    >
                      <SelectTrigger
                        aria-label={`Role for ${member.name}`}
                        size="sm"
                        className="min-w-32"
                      >
                        <SelectValue />
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
                  ) : (
                    <Badge variant="secondary">{member.roleName}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {member.emailVerified ? "Verified" : "Pending"}
                  </Badge>
                </TableCell>
                {canManage ? (
                  <TableCell>
                    {!locked && !isSelf ? (
                      <RemoveMemberButton
                        memberId={member.id}
                        memberName={member.name}
                      />
                    ) : null}
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
