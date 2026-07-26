import type { Metadata } from "next";
import { SignupPage } from "@/modules/auth/components/signup-page";

export const metadata: Metadata = {
  title: "Signup - SalesPilot",
  description: "Create your SalesPilot account",
};

export default async function SignupRoute({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const token = typeof resolvedParams.token === "string" ? resolvedParams.token : undefined;
  const initialEmail = typeof resolvedParams.email === "string" ? resolvedParams.email : undefined;
  const isInvite = resolvedParams.invite === "true" || !!token;

  return <SignupPage isInvite={isInvite} inviteToken={token} initialEmail={initialEmail} />;
}
