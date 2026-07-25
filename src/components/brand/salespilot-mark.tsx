import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface SalesPilotMarkProps {
  className?: string;
  title?: string;
}

/**
 * In-app mark: black rounded squircle + white “S”, transparent outside.
 * Matches the app-icon artwork; favicons add a white canvas separately.
 */
export function SalesPilotMark({
  className,
  title = "SalesPilot",
}: SalesPilotMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={cn("size-9 shrink-0", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect x="16" y="16" width="224" height="224" rx="48" fill="#171717" />
      <text
        x="128"
        y="172"
        textAnchor="middle"
        fontFamily="Inter, SF Pro Display, Helvetica, Arial, sans-serif"
        fontSize="128"
        fontWeight="700"
        fill="#ffffff"
      >
        S
      </text>
    </svg>
  );
}

interface SalesPilotBrandLinkProps
  extends Omit<ComponentProps<typeof Link>, "children" | "className"> {
  className?: string;
}

/**
 * Mark + wordmark lockup. Non-selectable text; entire control navigates.
 */
export function SalesPilotBrandLink({
  className,
  ...props
}: SalesPilotBrandLinkProps) {
  return (
    <Link
      {...props}
      className={cn(
        "flex items-center gap-2.5 font-semibold select-none",
        className,
      )}
    >
      <SalesPilotMark />
      <span className="select-none">SalesPilot</span>
    </Link>
  );
}
