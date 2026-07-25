import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";

export default async function MembersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const currentMember = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: { role: true },
  });

  if (!currentMember) {
    return <div>Not part of any organization.</div>;
  }

  const roleName =
    currentMember.role?.name || (currentMember.isOwner ? "Owner" : "Member");
  if (roleName !== "Owner" && roleName !== "Admin") {
    return <div>You do not have permission to view this page.</div>;
  }

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: currentMember.organizationId },
    include: {
      user: true,
      role: true,
    },
    orderBy: {
      joinedAt: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Members</h3>
          <p className="text-sm text-muted-foreground">
            Manage who has access to your organization.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Invite Member
        </button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.user.name}
                </TableCell>
                <TableCell>{member.user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {member.isOwner ? "Owner" : member.role?.name || "Member"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {member.user.emailVerified ? "Verified" : "Pending"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
