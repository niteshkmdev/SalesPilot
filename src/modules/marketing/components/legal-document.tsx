import type { LegalSection } from "@/modules/marketing/content/legal";
import { legalDisclaimer } from "@/modules/marketing/content/legal";

interface LegalDocumentProps {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalDocument({
  title,
  lastUpdated,
  sections,
}: LegalDocumentProps) {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
        <p className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
          {legalDisclaimer}
        </p>
      </header>
      <div className="flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold tracking-tight">
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph, index) => (
              <p
                key={`${section.title}-${index}`}
                className="text-sm leading-7 text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
