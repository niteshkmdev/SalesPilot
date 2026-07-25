"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";

const RenameOrganizationSchema = z.object({
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

  const parsed = RenameOrganizationSchema.safeParse({ name });
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
