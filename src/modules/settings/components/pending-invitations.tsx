"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InvitationDto } from "@/modules/organizations/dto/invitation.dto";
import { DeleteInvitationButton } from "@/modules/settings/components/delete-invitation-button";
import { ResendInvitationButton } from "@/modules/settings/components/resend-invitation-button";
import { RevokeInvitationButton } from "@/modules/settings/components/revoke-invitation-button";

interface PendingInvitationsProps {
  invitations: InvitationDto[];
  emptyVariant?: "none" | "filtered";
}

function expiresLabel(invitation: InvitationDto): string {
  if (invitation.isRevoked) return "Revoked";
  if (invitation.isExpired) return "Expired";
  return new Date(invitation.expiresAt).toLocaleDateString();
}

export function PendingInvitations({
  invitations,
  emptyVariant = "none",
}: PendingInvitationsProps) {
  if (invitations.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border border-dashed bg-card">
        <div className="flex flex-col items-center gap-1 px-6 text-center">
          <p className="text-sm font-medium">
            {emptyVariant === "filtered"
              ? "No invitations match your filters"
              : "No pending invitations"}
          </p>
          <p className="text-sm text-muted-foreground">
            {emptyVariant === "filtered"
              ? "Try clearing search or role filters."
              : "Invited teammates will show up here until they accept."}
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
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => {
            const inactive = invitation.isExpired || invitation.isRevoked;
            return (
              <TableRow key={invitation.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {invitation.email}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{invitation.roleName}</Badge>
                </TableCell>
                <TableCell
                  className={
                    inactive
                      ? "font-medium text-muted-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {expiresLabel(invitation)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <ResendInvitationButton
                      invitationId={invitation.id}
                      email={invitation.email}
                    />
                    {inactive ? (
                      <DeleteInvitationButton
                        invitationId={invitation.id}
                        email={invitation.email}
                      />
                    ) : (
                      <RevokeInvitationButton
                        invitationId={invitation.id}
                        email={invitation.email}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
