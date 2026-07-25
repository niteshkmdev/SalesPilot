import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";

export default async function OrganizationSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const member = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: { organization: true, role: true },
  });

  if (!member || !member.organization) {
    return <div>No organization found.</div>;
  }

  // Placeholder static form for now. Future PR will wire it to Server Actions.
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Organization Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your organization details.
        </p>
      </div>

      <form className="space-y-8">
        <div className="space-y-4">
          <div className="grid gap-2">
            <label
              htmlFor="orgName"
              className="text-sm font-medium leading-none"
            >
              Organization Name
            </label>
            <input
              id="orgName"
              type="text"
              defaultValue={member.organization.name}
              disabled // disabled for now to reflect WIP state
              className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="orgSlug"
              className="text-sm font-medium leading-none"
            >
              Slug URL
            </label>
            <input
              id="orgSlug"
              defaultValue={member.organization.slug}
              disabled
              className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Update Organization
        </button>
      </form>
    </div>
  );
}
