import { LegalDocument } from "@/modules/marketing/components/legal-document";
import {
  LEGAL_LAST_UPDATED,
  privacySections,
} from "@/modules/marketing/content/legal";

export function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      lastUpdated={LEGAL_LAST_UPDATED}
      sections={privacySections}
    />
  );
}
