import type { Metadata } from "next";
import { LoginPage } from "@/modules/auth/components/login-page";

export const metadata: Metadata = {
  title: "Login - SalesPilot",
  description: "Sign in to your SalesPilot account",
};

export default async function LoginRoute({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;
  const token = typeof resolved.token === "string" ? resolved.token : undefined;
  const initialEmail = typeof resolved.email === "string" ? resolved.email : undefined;

  return <LoginPage inviteToken={token} initialEmail={initialEmail} />;
}
