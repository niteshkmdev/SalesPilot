import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export async function AppShell({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  // Find the active organization membership for the user.
  // Assuming a single active organization per user for now, or relying on activeOrganizationId.
  // In our schema, we can look up organization_member.
  const member = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: { role: true },
  });

  // If no member record is found, maybe redirect to onboarding or assume "Member"
  const roleName = member?.role?.name || (member?.isOwner ? "Owner" : "Member");

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[256px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <div className="font-semibold tracking-tight text-lg">SalesPilot</div>
        </div>
        <Sidebar role={roleName} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col">
        <Header
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          }}
          role={roleName}
        />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
