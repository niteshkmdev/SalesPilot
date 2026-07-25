"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import {
  CreateLeadSchema,
  normalizeLeadPayload,
  UpdateLeadSchema,
} from "@/server/dto/lead.dto";
import { LeadService } from "@/server/services/lead.service";

const leadService = new LeadService();

async function requireSessionMember() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const member = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });

  if (!member) {
    throw new Error("User does not belong to any organization");
  }

  return { session, member };
}

export async function createLeadAction(data: unknown) {
  const { session, member } = await requireSessionMember();
  const parsed = CreateLeadSchema.parse(
    normalizeLeadPayload(data as Record<string, unknown>),
  );

  const lead = await leadService.createLead(
    session.user.id,
    member.organizationId,
    parsed,
  );

  revalidatePath("/leads");
  return { success: true, leadId: lead.id };
}

export async function updateLeadAction(leadId: string, data: unknown) {
  const { session, member } = await requireSessionMember();
  const parsed = UpdateLeadSchema.parse(
    normalizeLeadPayload(data as Record<string, unknown>),
  );

  await leadService.updateLead(
    session.user.id,
    member.organizationId,
    leadId,
    parsed,
  );

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  return { success: true };
}

export async function deleteLeadAction(leadId: string) {
  const { session, member } = await requireSessionMember();

  await leadService.deleteLead(session.user.id, member.organizationId, leadId);

  revalidatePath("/leads");
  return { success: true };
}
