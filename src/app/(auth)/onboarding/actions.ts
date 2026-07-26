"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { OnboardingState } from "@/modules/auth/constants/onboarding-state";
import { provisionOrganizationForUser } from "@/modules/organizations/services/provisioning.service";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";

const OrganizationNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .max(100),
});

/**
 * Completes the onboarding wizard for Google OAuth users (and any other user
 * who reaches /onboarding with onboardingState === "PENDING").
 *
 * Creates the organization with the chosen name, provisions the owner
 * membership, seeds default roles and lead statuses, and marks the user's
 * onboardingState as COMPLETED.
 *
 * Idempotent: if onboarding is already COMPLETED, returns success.
 */
export async function completeOnboardingAction(
  name: string,
): Promise<{ success: true } | { error: string }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "You must be signed in to continue." };
  }

  const parsed = OrganizationNameSchema.safeParse({ name });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid organization name.",
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
      onboardingState: true,
    },
  });

  if (!dbUser) {
    return { error: "User account not found." };
  }

  // Idempotent: already completed (e.g. if the user refreshed mid-submit).
  if (dbUser.onboardingState === OnboardingState.COMPLETED) {
    return { success: true };
  }

  try {
    await provisionOrganizationForUser(
      {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
        emailVerified: dbUser.emailVerified,
      },
      { organizationName: parsed.data.name },
    );

    await prisma.user.update({
      where: { id: dbUser.id },
      data: { onboardingState: OnboardingState.COMPLETED },
    });
  } catch (_err) {
    console.error("completeOnboardingAction failed:", _err);
    return { error: "Could not create your organization. Please try again." };
  }

  return { success: true };
}

/**
 * Creates a new organization for a COMPLETED user who currently has no
 * org membership (the /no-organization recovery flow).
 *
 * This does NOT change onboardingState — the user has already completed
 * onboarding; they simply lost their org membership.
 */
export async function createWorkspaceAction(
  name: string,
): Promise<{ success: true } | { error: string }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "You must be signed in to continue." };
  }

  if (!session.user.emailVerified) {
    return { error: "Verify your email before creating a workspace." };
  }

  const parsed = OrganizationNameSchema.safeParse({ name });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid organization name.",
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
    },
  });

  if (!dbUser) {
    return { error: "User account not found." };
  }

  // Guard: user must not already belong to an org (race condition protection).
  const existingMember = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });
  if (existingMember) {
    return { error: "You already belong to a workspace." };
  }

  try {
    await provisionOrganizationForUser(
      {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
        emailVerified: dbUser.emailVerified,
      },
      { organizationName: parsed.data.name },
    );
  } catch (_err) {
    return { error: "Could not create workspace. Please try again." };
  }

  return { success: true };
}
