import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/modules/settings/components/profile-form";
import { auth } from "@/server/auth/auth";

export default async function ProfileSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          This is how others will see you in the workspace.
        </p>
      </div>
      <ProfileForm user={session.user} />
    </div>
  );
}
