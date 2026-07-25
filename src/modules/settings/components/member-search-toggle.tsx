"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 300;

interface MemberSearchToggleProps {
  initialQuery?: string;
}

function MemberSearchToggleInner({
  initialQuery = "",
}: MemberSearchToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [expanded, setExpanded] = useState(Boolean(initialQuery.trim()));
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    setValue(initialQuery);
    if (initialQuery.trim()) {
      setExpanded(true);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (expanded) {
      inputRef.current?.focus();
    }
  }, [expanded]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = value.trim();
      const current = (searchParams.get("q") ?? "").trim();
      if (next === current) return;

      const params = new URLSearchParams(searchParams.toString());
      if (next) {
        params.set("q", next);
      } else {
        params.delete("q");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [value, pathname, router, searchParams]);

  return (
    <div className="flex items-center gap-2">
      {expanded ? (
        <div className="relative w-72 sm:w-80">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && value.trim()) {
                setValue("");
              }
            }}
            placeholder="Search members..."
            aria-label="Search members"
            className="h-10 border-input bg-background pr-10 pl-9 shadow-none"
          />
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-1/2 right-1.5 -translate-y-1/2"
              onClick={() => {
                setValue("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              <X />
            </Button>
          ) : null}
        </div>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-10 shrink-0"
        aria-label={expanded ? "Hide search" : "Show search"}
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        <Search />
      </Button>
    </div>
  );
}

export function MemberSearchToggle(props: MemberSearchToggleProps) {
  return (
    <Suspense
      fallback={
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10"
          disabled
        >
          <Search />
        </Button>
      }
    >
      <MemberSearchToggleInner {...props} />
    </Suspense>
  );
}
