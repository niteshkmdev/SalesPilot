import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingPage } from "@/modules/auth/components/onboarding-page";
import { OnboardingState } from "@/modules/auth/constants/onboarding-state";
import { authService } from "@/modules/auth/services/auth.service";
import { prisma } from "@/server/db/prisma";
import { ApiErrorCode, AppError } from "@/shared/api/errors";

export const metadata: Metadata = {
  title: "Onboarding - SalesPilot",
  description: "Complete your organization setup",
};

/**
 * Onboarding route — exclusively for users with onboardingState === "PENDING".
 *
 * Guards:
 *  - Unauthenticated → /login
 *  - Unverified email → /verify
 *  - Already COMPLETED → /auth/callback (resolver will send them to the right place)
 */
export default async function OnboardingRoute() {
  let user: Awaited<ReturnType<typeof authService.requireUser>>;

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

  // Fetch the onboarding state directly — it is not part of the session payload.
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { onboardingState: true },
  });

  // If onboarding is already complete, the resolver will pick the right destination.
  if (dbUser?.onboardingState === OnboardingState.COMPLETED) {
    redirect("/auth/callback");
  }

  return <OnboardingPage />;
}
