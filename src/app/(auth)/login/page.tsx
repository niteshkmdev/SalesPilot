import type { Metadata } from "next";
import { LoginPage } from "@/modules/auth/components/login-page";

export const metadata: Metadata = {
  title: "Login - SalesPilot",
  description: "Sign in to your SalesPilot account",
};

export default function LoginRoute() {
  return <LoginPage />;
}
