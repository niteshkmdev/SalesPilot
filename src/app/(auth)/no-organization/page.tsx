import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NoOrganizationPage } from "@/modules/auth/components/no-organization-page";
import { authService } from "@/modules/auth/services/auth.service";
import { ApiErrorCode, AppError } from "@/shared/api/errors";

export const metadata: Metadata = {
  title: "No Workspace - SalesPilot",
  description: "Create or join a workspace to continue",
};

/**
 * Recovery page for authenticated users who have no active org membership.
 *
 * This page is reached when:
 *   - onboardingState === "COMPLETED" (set by post-auth resolver)
 *   - No active OrganizationMember record exists for this user
 *
 * Guards:
 *   - Unauthenticated → /login
 *   - Unverified email → /verify
 */
export default async function NoOrganizationRoute() {
  try {
    await authService.requireUser();
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

  return <NoOrganizationPage />;
}
