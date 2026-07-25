"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { SalesPilotBrandLink } from "@/components/brand/salespilot-mark";
import { authClient } from "@/lib/auth-client";

type EscapeAction =
  | { kind: "link"; href: string; label: string }
  | { kind: "logout"; label: string };

function getEscapeAction(pathname: string): EscapeAction {
  if (pathname.startsWith("/onboarding")) {
    return { kind: "logout", label: "Log out" };
  }

  if (
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify")
  ) {
    return { kind: "link", href: "/login", label: "← Back to login" };
  }

  return { kind: "link", href: "/", label: "← Back to home" };
}

export function AuthChrome() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const escapeAction = getEscapeAction(pathname);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch (_err) {
      toast.error("Error signing out");
      setIsSigningOut(false);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <SalesPilotBrandLink href="/" />
      {escapeAction.kind === "link" ? (
        <Link
          href={escapeAction.href}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {escapeAction.label}
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          {isSigningOut ? "Signing out..." : escapeAction.label}
        </button>
      )}
    </header>
  );
}
