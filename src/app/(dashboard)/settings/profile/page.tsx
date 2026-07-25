import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/modules/settings/components/profile-form";
import { auth } from "@/server/auth/auth";

export default async function ProfileSettingsPage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    redirect("/login");
  }

  const accounts = await auth.api.listUserAccounts({
    headers: requestHeaders,
  });

  const hasCredential = accounts.some(
    (account) => account.providerId === "credential",
  );
  const hasGoogle = accounts.some((account) => account.providerId === "google");
  // Unlink only when another sign-in method remains.
  const canUnlinkGoogle =
    hasGoogle && accounts.some((account) => account.providerId !== "google");

  const user = session.user as {
    name: string;
    email: string;
    image?: string | null;
    phone?: string | null;
    gender?: string | null;
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        title="Profile"
        subtitle="Photo, contact details, password, and linked sign-in methods."
      />
      <ProfileForm
        user={{
          name: user.name,
          email: user.email,
          image: user.image ?? null,
          phone: user.phone ?? null,
          gender: user.gender ?? null,
        }}
        hasCredential={hasCredential}
        hasGoogle={hasGoogle}
        canUnlinkGoogle={canUnlinkGoogle}
      />
    </div>
  );
}
