"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CopyPublicFormLinkButtonProps {
  publicPath: string;
  disabled?: boolean;
}

export function CopyPublicFormLinkButton({
  publicPath,
  disabled = false,
}: CopyPublicFormLinkButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={async () => {
        const url = `${window.location.origin}${publicPath}`;
        await navigator.clipboard.writeText(url);
        toast.success("Public URL copied");
      }}
    >
      <Copy data-icon="inline-start" />
      Copy link
    </Button>
  );
}
