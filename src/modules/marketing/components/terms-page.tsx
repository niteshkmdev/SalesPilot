import { LegalDocument } from "@/modules/marketing/components/legal-document";
import {
  LEGAL_LAST_UPDATED,
  termsSections,
} from "@/modules/marketing/content/legal";

export function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      lastUpdated={LEGAL_LAST_UPDATED}
      sections={termsSections}
    />
  );
}
