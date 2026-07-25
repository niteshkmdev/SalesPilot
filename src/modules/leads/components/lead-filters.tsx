import { Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LeadSourceDto, LeadStatusDto } from "@/server/dto/lead.dto";

const selectClassName =
  "flex h-9 w-full min-w-[10rem] rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

interface LeadFiltersProps {
  statuses: LeadStatusDto[];
  sources: LeadSourceDto[];
  q?: string;
  statusId?: string;
  sourceId?: string;
}

export function LeadFilters({
  statuses,
  sources,
  q = "",
  statusId = "",
  sourceId = "",
}: LeadFiltersProps) {
  const hasFilters = Boolean(q || statusId || sourceId);

  return (
    <form
      method="get"
      className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="flex min-w-[14rem] flex-1 flex-col gap-2">
        <label htmlFor="q" className="text-sm font-medium">
          Search
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Name, email, phone, company..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto">
        <label htmlFor="statusId" className="text-sm font-medium">
          Status
        </label>
        <select
          id="statusId"
          name="statusId"
          defaultValue={statusId}
          className={selectClassName}
        >
          <option value="">All statuses</option>
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto">
        <label htmlFor="sourceId" className="text-sm font-medium">
          Source
        </label>
        <select
          id="sourceId"
          name="sourceId"
          defaultValue={sourceId}
          className={selectClassName}
        >
          <option value="">All sources</option>
          {sources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit">Apply</Button>
        {hasFilters ? (
          <Button type="button" variant="outline" asChild>
            <Link href="/leads">Clear</Link>
          </Button>
        ) : null}
      </div>
    </form>
  );
}
