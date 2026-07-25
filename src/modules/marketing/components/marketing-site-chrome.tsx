import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { SalesPilotBrandLink } from "@/components/brand/salespilot-mark";
import { Button } from "@/components/ui/button";

interface MarketingSiteHeaderProps {
  isAuthenticated?: boolean;
}

export function MarketingSiteHeader({
  isAuthenticated = false,
}: MarketingSiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <SalesPilotBrandLink href="/" />
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-6 text-sm text-muted-foreground md:flex"
        >
          <Link href="/#features" className="hover:text-foreground">
            Features
          </Link>
          <Link href="/#pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/#faq" className="hover:text-foreground">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button asChild>
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">
                  Get Started
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function MarketingSiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>© 2026 SalesPilot. Built for focused sales teams.</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
