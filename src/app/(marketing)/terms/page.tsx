import type { Metadata } from "next";
import { TermsPage } from "@/modules/marketing/components/terms-page";

export const metadata: Metadata = {
  title: "Terms of Service - SalesPilot",
  description: "Terms of Service for SalesPilot",
};

export default function TermsRoute() {
  return <TermsPage />;
}
