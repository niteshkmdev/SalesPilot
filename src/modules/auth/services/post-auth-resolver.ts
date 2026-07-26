import { OnboardingState } from "@/modules/auth/constants/onboarding-state";
import { findFirstActiveMemberByUserId } from "@/modules/organizations/repository/member.repository";
import { prisma } from "@/server/db/prisma";

/**
 * Unified post-authentication resolver.
 *
 * This is the single source of truth for where a user goes after any
 * successful authentication event (email login, Google OAuth, etc.).
 *
 * Decision tree:
 *
 *  1. onboardingState === "PENDING"?
 *     → /onboarding
 *     Covers: brand-new accounts AND users who abandoned the onboarding
 *     wizard mid-flow and returned later.
 *
 *  2. onboardingState === "COMPLETED", no active org membership?
 *     → /no-organization
 *     Covers: users who had an org but were removed, or whose org was deleted.
 *
 *  3. onboardingState === "COMPLETED", has active org?
 *     → /dashboard
 *
 * IMPORTANT: "new user" is NEVER inferred from org count alone.
 * onboardingState is the sole authority for that distinction.
 */
export async function resolvePostAuthDestination(
  userId: string,
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingState: true },
  });

  if (!user) return "/login";

  // Route all users who haven't completed onboarding through the wizard.
  if (user.onboardingState !== OnboardingState.COMPLETED) {
    return "/onboarding";
  }

  // Onboarding is done — verify they still have an active org membership.
  const member = await findFirstActiveMemberByUserId(prisma, userId);
  if (!member) {
    return "/no-organization";
  }

  return "/dashboard";
}
