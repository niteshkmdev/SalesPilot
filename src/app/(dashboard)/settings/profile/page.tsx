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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>
      <ProfileForm user={session.user} />
    </div>
  );
}
