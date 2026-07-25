import type { Metadata } from "next";
import { PrivacyPage } from "@/modules/marketing/components/privacy-page";

export const metadata: Metadata = {
  title: "Privacy Policy - SalesPilot",
  description: "Privacy Policy for SalesPilot",
};

export default function PrivacyRoute() {
  return <PrivacyPage />;
}
