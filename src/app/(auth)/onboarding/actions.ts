"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { findFirstActiveMemberByUserId } from "@/modules/organizations/repository/member.repository";
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

export async function renameOrganizationAction(name: string) {
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

  const member = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  });

  if (!member) {
    return { error: "No organization found for your account." };
  }

  if (!member.isOwner) {
    return { error: "Only the organization owner can rename the workspace." };
  }

  await prisma.organization.update({
    where: { id: member.organizationId },
    data: { name: parsed.data.name },
  });

  return { success: true as const };
}

/**
 * Creates a workspace for a verified user who has no organization membership.
 * Used when signup provision failed, or after a user is removed from their only org.
 */
export async function createWorkspaceAction(name: string) {
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

  const existing = await findFirstActiveMemberByUserId(prisma, session.user.id);
  if (existing) {
    return { error: "You already belong to a workspace." };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!dbUser) {
    return { error: "User account not found." };
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

  return { success: true as const };
}
