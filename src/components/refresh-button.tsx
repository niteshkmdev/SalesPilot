"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleRefresh}
      disabled={isPending}
      title="Refresh"
    >
      <RefreshCw className={isPending ? "animate-spin" : ""} />
      <span className="sr-only">Refresh</span>
    </Button>
  );
}
