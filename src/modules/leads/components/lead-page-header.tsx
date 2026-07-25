import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface LeadPageHeaderProps {
  backHref: string;
  backLabel?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function LeadPageHeader({
  backHref,
  backLabel = "Back to leads",
  title,
  subtitle,
  actions,
}: LeadPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-3">
        <Button variant="ghost" size="sm" className="w-fit px-0" asChild>
          <Link href={backHref}>
            <ArrowLeft data-icon="inline-start" />
            {backLabel}
          </Link>
        </Button>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          </div>
          {subtitle ? (
            <p className="mt-1 text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
