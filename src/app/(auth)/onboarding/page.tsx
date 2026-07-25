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
 * Onboarding: rename existing org, or create a workspace when the user
 * has no membership (failed signup provision, or removed from their only org).
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
    return <OnboardingPage missingOrganization />;
  }

  return <OnboardingPage />;
}
