"use server";

import { revalidatePath } from "next/cache";
import {
  AssignLeadSchema,
  assignLead,
  CreateLeadSchema,
  createLead,
  deleteLead,
  normalizeLeadPayload,
  UpdateLeadSchema,
  updateLead,
} from "@/modules/leads";
import { AppError } from "@/shared/api/errors";

function actionError(error: unknown): { error: string } {
  if (error instanceof AppError) {
    return { error: error.message };
  }
  if (error instanceof Error) {
    return { error: error.message };
  }
  return { error: "Something went wrong." };
}

function revalidateLeadPaths(leadId?: string) {
  revalidatePath("/leads");
  if (leadId) {
    revalidatePath(`/leads/${leadId}`);
  }
}

export async function createLeadAction(data: unknown) {
  try {
    const parsed = CreateLeadSchema.parse(
      normalizeLeadPayload(data as Record<string, unknown>),
    );
    const lead = await createLead(parsed);
    revalidateLeadPaths(lead.id);
    return { success: true as const, leadId: lead.id };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateLeadAction(leadId: string, data: unknown) {
  try {
    const parsed = UpdateLeadSchema.parse(
      normalizeLeadPayload(data as Record<string, unknown>),
    );
    await updateLead(leadId, parsed);
    revalidateLeadPaths(leadId);
    return { success: true as const };
  } catch (error) {
    return actionError(error);
  }
}

export async function assignLeadAction(leadId: string, data: unknown) {
  try {
    const parsed = AssignLeadSchema.parse(data);
    await assignLead(leadId, parsed);
    revalidateLeadPaths(leadId);
    return { success: true as const };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteLeadAction(leadId: string) {
  try {
    await deleteLead(leadId);
    revalidateLeadPaths(leadId);
    return { success: true as const };
  } catch (error) {
    return actionError(error);
  }
}
