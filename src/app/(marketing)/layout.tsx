import { headers } from "next/headers";
import type React from "react";
import {
  MarketingSiteFooter,
  MarketingSiteHeader,
} from "@/modules/marketing/components/marketing-site-chrome";
import { auth } from "@/server/auth/auth";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <MarketingSiteHeader isAuthenticated={Boolean(session?.user)} />
      <main className="flex flex-1 justify-center px-6 py-10">
        <div className="w-full max-w-3xl">{children}</div>
      </main>
      <MarketingSiteFooter />
    </div>
  );
}
