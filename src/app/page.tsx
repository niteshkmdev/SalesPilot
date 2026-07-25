import { headers } from "next/headers";
import { LandingPage } from "@/modules/marketing/components/landing-page";
import { auth } from "@/server/auth/auth";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return <LandingPage isAuthenticated={Boolean(session?.user)} />;
}
