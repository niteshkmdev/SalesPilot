import { format } from "date-fns";
import { ArrowLeft, Pencil } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { LeadService } from "@/server/services/lead.service";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: leadId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const member = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });

  if (!member) {
    return <div>No organization found.</div>;
  }

  const leadService = new LeadService();
  const lead = await leadService.getLead(
    session.user.id,
    member.organizationId,
    leadId,
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <Button variant="ghost" size="sm" className="w-fit px-0" asChild>
            <Link href="/leads">
              <ArrowLeft data-icon="inline-start" />
              Back to leads
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {lead.firstName} {lead.lastName}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {[lead.jobTitle, lead.company].filter(Boolean).join(" at ") ||
                "No company details"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {lead.status ? (
            <Badge
              variant="outline"
              style={{
                backgroundColor: `${lead.status.color}20`,
                color: lead.status.color,
                borderColor: lead.status.color,
              }}
            >
              {lead.status.name}
            </Badge>
          ) : null}
          <Button variant="outline" asChild>
            <Link href={`/leads/${lead.id}/edit`}>
              <Pencil data-icon="inline-start" />
              Edit Lead
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>How to reach this lead.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-4 border-b pb-2">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{lead.email || "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b pb-2">
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="font-medium">{lead.phone || "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Website</dt>
                <dd className="font-medium">
                  {lead.website ? (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      {lead.website}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
            <CardDescription>Ownership and intake details.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-4 border-b pb-2">
                <dt className="text-muted-foreground">Assigned to</dt>
                <dd className="font-medium">
                  {lead.assignedMember?.name || "Unassigned"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b pb-2">
                <dt className="text-muted-foreground">Source</dt>
                <dd className="font-medium">{lead.source?.name || "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium">
                  {format(new Date(lead.createdAt), "PPP")}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>Context for the team.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {lead.description || "No notes yet for this lead."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
