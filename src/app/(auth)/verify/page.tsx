import type { Metadata } from "next";
import { VerifyPage } from "@/modules/auth/components/verify-page";

export const metadata: Metadata = {
  title: "Verify Email - SalesPilot",
  description: "Verify your SalesPilot account",
};

export default function VerifyRoute() {
  return <VerifyPage />;
}
