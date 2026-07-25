import type { Metadata } from "next";
import { ResetPasswordPage } from "@/modules/auth/components/reset-password-page";

export const metadata: Metadata = {
  title: "Reset Password - SalesPilot",
  description: "Choose a new SalesPilot password",
};

export default function ResetPasswordRoute() {
  return <ResetPasswordPage />;
}
