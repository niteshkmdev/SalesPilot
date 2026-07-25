"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  archiveLeadForm,
  CreateLeadFormSchema,
  createLeadForm,
  PublicFormSubmitSchema,
  publishLeadForm,
  softDeleteLeadForm,
  submitPublicForm,
  UpdateLeadFormSchema,
  unarchiveLeadForm,
  updateLeadForm,
} from "@/modules/lead-forms";
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

function revalidateForms(formId?: string) {
  revalidatePath("/forms");
  if (formId) {
    revalidatePath(`/forms/view/${formId}`);
    revalidatePath(`/forms/edit/${formId}`);
  }
}

export async function createLeadFormAction(data: unknown) {
  try {
    const parsed = CreateLeadFormSchema.parse(data);
    const form = await createLeadForm(parsed);
    revalidateForms(form.id);
    return { success: true as const, formId: form.id };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateLeadFormAction(formId: string, data: unknown) {
  try {
    const parsed = UpdateLeadFormSchema.parse(data);
    const form = await updateLeadForm(formId, parsed);
    revalidateForms(form.id);
    return { success: true as const };
  } catch (error) {
    return actionError(error);
  }
}

export async function publishLeadFormAction(formId: string) {
  try {
    await publishLeadForm(formId);
    revalidateForms(formId);
    return { success: true as const };
  } catch (error) {
    return actionError(error);
  }
}

export async function archiveLeadFormAction(formId: string) {
  try {
    await archiveLeadForm(formId);
    revalidateForms(formId);
    return { success: true as const };
  } catch (error) {
    return actionError(error);
  }
}

export async function unarchiveLeadFormAction(formId: string) {
  try {
    await unarchiveLeadForm(formId);
    revalidateForms(formId);
    return { success: true as const };
  } catch (error) {
    return actionError(error);
  }
}

export async function softDeleteLeadFormAction(formId: string) {
  try {
    await softDeleteLeadForm(formId);
    revalidateForms(formId);
    return { success: true as const };
  } catch (error) {
    return actionError(error);
  }
}

export async function submitPublicFormAction(input: {
  orgSlug: string;
  formSlug: string;
  values: Record<string, unknown>;
  turnstileToken?: string;
}) {
  try {
    const parsed = PublicFormSubmitSchema.parse({
      values: input.values,
      turnstileToken: input.turnstileToken,
    });
    const headerStore = await headers();
    const result = await submitPublicForm({
      orgSlug: input.orgSlug,
      formSlug: input.formSlug,
      values: parsed.values,
      turnstileToken: parsed.turnstileToken,
      ipAddress:
        headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headerStore.get("x-real-ip"),
      userAgent: headerStore.get("user-agent"),
    });
    return { success: true as const, ...result };
  } catch (error) {
    return actionError(error);
  }
}
