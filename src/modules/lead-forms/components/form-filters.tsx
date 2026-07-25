"use client";

import { ListFilter } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const statuses = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
] as const;

interface FormFiltersProps {
  q?: string;
  status?: string;
}

function FormFiltersInner({ q, status }: FormFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [statusValue, setStatusValue] = useState(status ?? "all");

  const activeCount = status ? 1 : 0;

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    if (statusValue && statusValue !== "all") {
      params.set("status", statusValue);
    } else {
      params.delete("status");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    setOpen(false);
  };

  const clear = () => {
    setStatusValue("all");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    if (q) params.set("q", q);
    else params.delete("q");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" className="relative h-10 gap-2">
          <ListFilter data-icon="inline-start" />
          Filters
          {activeCount > 0 ? (
            <Badge variant="secondary" className="ml-1">
              {activeCount}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter forms</SheetTitle>
          <SheetDescription>
            Narrow the list by publish status.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="form-status">Status</Label>
            <Select value={statusValue} onValueChange={setStatusValue}>
              <SelectTrigger id="form-status" className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statuses.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter>
          <Button type="button" variant="outline" onClick={clear}>
            Clear
          </Button>
          <Button type="button" onClick={apply}>
            Apply filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function FormFilters(props: FormFiltersProps) {
  return (
    <Suspense
      fallback={
        <Button type="button" variant="outline" className="h-10" disabled>
          <ListFilter data-icon="inline-start" />
          Filters
        </Button>
      }
    >
      <FormFiltersInner {...props} />
    </Suspense>
  );
}
