import Link from "next/link";
import { Button } from "@/components/ui/button";

interface LeadPaginationProps {
  page: number;
  totalPages: number;
  count: number;
  limit: number;
  query: Record<string, string | undefined>;
}

function buildPageHref(
  query: Record<string, string | undefined>,
  page: number,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value && key !== "page") {
      params.set(key, value);
    }
  }
  params.set("page", String(page));
  return `/leads?${params.toString()}`;
}

export function LeadPagination({
  page,
  totalPages,
  count,
  limit,
  query,
}: LeadPaginationProps) {
  if (count === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, count);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {from}–{to} of {count}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild disabled={page <= 1}>
          <Link
            href={buildPageHref(query, Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
          >
            Previous
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          asChild
          disabled={page >= totalPages}
        >
          <Link
            href={buildPageHref(query, Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            className={
              page >= totalPages ? "pointer-events-none opacity-50" : undefined
            }
          >
            Next
          </Link>
        </Button>
      </div>
    </div>
  );
}
