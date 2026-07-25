import type { Metadata } from "next";
import { ForgotPasswordPage } from "@/modules/auth/components/forgot-password-page";

export const metadata: Metadata = {
  title: "Forgot Password - SalesPilot",
  description: "Reset your SalesPilot password",
};

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
