import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DigitalHeroesAttribution } from "@/components/digital-heroes-attribution";
import { requireAppContext } from "@/modules/auth/services/app-context.service";
import type { OrganizationContext } from "@/modules/organizations/types/OrganizationContext";
import { ApiErrorCode, AppError } from "@/shared/api/errors";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export async function AppShell({ children }: { children: ReactNode }) {
  let context: OrganizationContext;

  try {
    context = await requireAppContext();
  } catch (error) {
    if (error instanceof AppError) {
      if (error.code === ApiErrorCode.AUTHENTICATION_REQUIRED) {
        redirect("/login");
      }
      if (error.code === ApiErrorCode.EMAIL_VERIFICATION_REQUIRED) {
        redirect("/verify");
      }
      if (error.code === ApiErrorCode.ORGANIZATION_REQUIRED) {
        // The user has completed onboarding (COMPLETED state) but has no active
        // org membership — send them to the recovery flow, not onboarding.
        redirect("/no-organization");
      }
    }
    throw error;
  }

  const roleName = context.member.roleName;

  return (
    <div className="min-h-screen w-full bg-muted/30">
      <Sidebar
        role={roleName}
        user={{
          name: context.user.name,
          email: context.user.email,
          image: context.user.image,
        }}
      />

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-[280px]">
        <Header
          user={{
            name: context.user.name,
            email: context.user.email,
            image: context.user.image,
          }}
          role={roleName}
          organization={{
            name: context.organization.name,
            logo: context.organization.logo,
          }}
        />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
        <footer className="border-t bg-background px-4 py-3">
          <DigitalHeroesAttribution />
        </footer>
      </div>
    </div>
  );
}
