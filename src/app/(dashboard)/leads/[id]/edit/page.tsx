import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LeadForm } from "@/modules/leads/components/lead-form";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { LeadService } from "@/server/services/lead.service";

export default async function EditLeadPage({
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
  const [lead, statuses, sources] = await Promise.all([
    leadService.getLead(session.user.id, member.organizationId, leadId),
    leadService.getStatuses(session.user.id, member.organizationId),
    leadService.getSources(session.user.id, member.organizationId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Lead</h1>
        <p className="text-muted-foreground">
          Update details for {lead.firstName} {lead.lastName}.
        </p>
      </div>

      <LeadForm initialData={lead} statuses={statuses} sources={sources} />
    </div>
  );
}
