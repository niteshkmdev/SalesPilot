import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingPage } from "@/modules/auth/components/onboarding-page";
import { authService } from "@/modules/auth/services/auth.service";
import { findFirstActiveMemberByUserId } from "@/modules/organizations/repository/member.repository";
import type { ActiveUser } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { ApiErrorCode, AppError } from "@/shared/api/errors";

export const metadata: Metadata = {
  title: "Onboarding - SalesPilot",
  description: "Complete your organization setup",
};

/**
 * Onboarding is edit-org-name only. Organization creation happens in the
 * Better Auth user.create hook — this page never provisions.
 */
export default async function OnboardingRoute() {
  let user: ActiveUser;

  try {
    user = await authService.requireUser();
  } catch (error) {
    if (error instanceof AppError) {
      if (error.code === ApiErrorCode.AUTHENTICATION_REQUIRED) {
        redirect("/login");
      }
      if (error.code === ApiErrorCode.EMAIL_VERIFICATION_REQUIRED) {
        redirect("/verify");
      }
    }
    throw error;
  }

  const member = await findFirstActiveMemberByUserId(prisma, user.id);

  if (!member) {
    // Hook failed or race — show onboarding with recovery messaging via page UI.
    // Do not create a second organization here.
    return <OnboardingPage missingOrganization />;
  }

  return <OnboardingPage />;
}
