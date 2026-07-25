import Image from "next/image";
import { cn } from "@/lib/utils";
import type { FormBrandingDisplayValue } from "@/modules/lead-forms/dto/lead-form.dto";

interface PublicFormBrandHeaderProps {
  organizationName: string;
  formName: string;
  description?: string | null;
  logoUrl?: string | null;
  brandingDisplay: FormBrandingDisplayValue;
  accentColor?: string | null;
}

export function PublicFormBrandHeader({
  organizationName,
  formName,
  description,
  logoUrl,
  brandingDisplay,
  accentColor,
}: PublicFormBrandHeaderProps) {
  const showLogo = brandingDisplay !== "NAME" && Boolean(logoUrl);
  // LOGO-only without a logo URL falls back to showing the org name.
  const showOrgName = brandingDisplay !== "LOGO" || !logoUrl;
  const showBrandRow = showLogo || showOrgName;

  return (
    <header className="flex flex-col gap-5">
      {showBrandRow ? (
        <div
          className={cn(
            "flex items-center gap-3",
            "border-b border-border/60 pb-4",
          )}
        >
          {showLogo && logoUrl ? (
            <div className="relative size-14 shrink-0 overflow-hidden rounded-full border bg-muted ring-1 ring-border/60">
              <Image
                src={logoUrl}
                alt={organizationName}
                fill
                unoptimized
                className="object-cover"
                sizes="56px"
              />
            </div>
          ) : null}
          {showOrgName ? (
            <p className="min-w-0 truncate text-base font-semibold text-foreground">
              {organizationName}
            </p>
          ) : null}
        </div>
      ) : null}

      <div>
        <h1
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
          style={accentColor ? { color: accentColor } : undefined}
        >
          {formName}
        </h1>
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </header>
  );
}
