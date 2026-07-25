import type { Metadata } from "next";
import { SignupPage } from "@/modules/auth/components/signup-page";

export const metadata: Metadata = {
  title: "Signup - SalesPilot",
  description: "Create your SalesPilot account",
};

// In Next.js App Router, to access search params in a Server Component page:
export default async function SignupRoute({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const isInvite = resolvedParams.invite === "true" || !!resolvedParams.token;

  return <SignupPage isInvite={isInvite} />;
}
