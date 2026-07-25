"use server";

import { redirect } from "next/navigation";
import { acceptInvitationForCurrentUser } from "@/modules/organizations/services/invitation.service";
import { AppError } from "@/shared/api/errors";

export async function acceptInvitationAction(token: string) {
  try {
    await acceptInvitationForCurrentUser(token);
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }
    console.error(error);
    return { error: "Could not accept invitation." };
  }

  redirect("/dashboard");
}
