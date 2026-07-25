"use server";

import { revalidatePath } from "next/cache";
import {
  CreateCustomFieldSchema,
  createCustomField,
  deactivateCustomField,
  UpdateCustomFieldSchema,
  updateCustomField,
} from "@/modules/custom-fields";
import {
  deleteInvitation,
  inviteMember,
  resendInvitation,
  revokeInvitation,
} from "@/modules/organizations/services/invitation.service";
import {
  changeMemberRole,
  removeMember,
} from "@/modules/organizations/services/member.service";
import { updateCurrentOrganization } from "@/modules/organizations/services/organization.service";
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

function revalidateMembers() {
  revalidatePath("/settings/members");
}

export async function inviteMemberAction(data: {
  email: string;
  roleId: string;
}) {
  try {
    const result = await inviteMember(data);
    revalidateMembers();
    return {
      success: true as const,
      emailSent: result.emailSent,
      invitation: result.invitation,
    };
  } catch (error) {
    return actionError(error);
  }
}

export async function resendInvitationAction(invitationId: string) {
  try {
    const result = await resendInvitation(invitationId);
    revalidateMembers();
    return { success: true as const, emailSent: result.emailSent };
  } catch (error) {
    return actionError(error);
  }
}

export async function revokeInvitationAction(invitationId: string) {
  try {
    await revokeInvitation(invitationId);
    revalidateMembers();
    return { success: true as const };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteInvitationAction(invitationId: string) {
  try {
    await deleteInvitation(invitationId);
    revalidateMembers();
    return { success: true as const };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateMemberRoleAction(memberId: string, roleId: string) {
  try {
    await changeMemberRole(memberId, roleId);
    revalidateMembers();
    return { success: true as const };
  } catch (error) {
    return actionError(error);
  }
}

export async function removeMemberAction(memberId: string) {
  try {
    await removeMember(memberId);
    revalidateMembers();
    return { success: true as const };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateOrganizationAction(data: { name: string }) {
  try {
    const organization = await updateCurrentOrganization(data);
    revalidatePath("/settings/organization");
    revalidatePath("/dashboard");
    return { success: true as const, organization };
  } catch (error) {
    return actionError(error);
  }
}

export async function createCustomFieldAction(data: unknown) {
  try {
    const parsed = CreateCustomFieldSchema.parse(data);
    const field = await createCustomField(parsed);
    revalidatePath("/settings/custom-fields");
    revalidatePath("/leads/new");
    return { success: true as const, field };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateCustomFieldAction(fieldId: string, data: unknown) {
  try {
    const parsed = UpdateCustomFieldSchema.parse(data);
    const field = await updateCustomField(fieldId, parsed);
    revalidatePath("/settings/custom-fields");
    revalidatePath("/leads/new");
    return { success: true as const, field };
  } catch (error) {
    return actionError(error);
  }
}

export async function deactivateCustomFieldAction(fieldId: string) {
  try {
    const field = await deactivateCustomField(fieldId);
    revalidatePath("/settings/custom-fields");
    revalidatePath("/leads/new");
    return { success: true as const, field };
  } catch (error) {
    return actionError(error);
  }
}
