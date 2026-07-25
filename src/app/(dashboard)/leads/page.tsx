import { Plus } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LeadFilters } from "@/modules/leads/components/lead-filters";
import { LeadTable } from "@/modules/leads/components/lead-table";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { LeadListFiltersSchema } from "@/server/dto/lead.dto";
import { LeadService } from "@/server/services/lead.service";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; statusId?: string; sourceId?: string }>;
}) {
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
    return <div>User does not belong to any organization.</div>;
  }

  const params = await searchParams;
  const filters = LeadListFiltersSchema.parse({
    q: params.q || undefined,
    statusId: params.statusId || undefined,
    sourceId: params.sourceId || undefined,
  });

  const leadService = new LeadService();
  const [{ leads, count }, statuses, sources] = await Promise.all([
    leadService.getLeads(session.user.id, member.organizationId, filters),
    leadService.getStatuses(session.user.id, member.organizationId),
    leadService.getSources(session.user.id, member.organizationId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track your pipeline. {count} lead{count === 1 ? "" : "s"}
            .
          </p>
        </div>
        <Button asChild>
          <Link href="/leads/new">
            <Plus data-icon="inline-start" />
            New Lead
          </Link>
        </Button>
      </div>

      <LeadFilters
        statuses={statuses}
        sources={sources}
        q={filters.q}
        statusId={filters.statusId}
        sourceId={filters.sourceId}
      />

      <LeadTable leads={leads} />
    </div>
  );
}
