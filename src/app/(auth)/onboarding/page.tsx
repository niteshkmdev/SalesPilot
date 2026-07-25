import type { Metadata } from "next";
import { OnboardingPage } from "@/modules/auth/components/onboarding-page";

export const metadata: Metadata = {
  title: "Onboarding - SalesPilot",
  description: "Complete your organization setup",
};

export default function OnboardingRoute() {
  return <OnboardingPage />;
}
