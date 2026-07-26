import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Email Verified - SalesPilot",
  description: "Your email has been successfully verified",
};

/**
 * Landing page for the verification email link.
 *
 * When the user clicks the link in the verification email, Better Auth
 * verifies the token and redirects to this page (via the callbackURL we
 * injected in sendVerificationEmail).
 *
 * The "Continue" CTA sends the user to /login because
 * autoSignInAfterVerification is disabled for security.
 */
export default function VerifyConfirmedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="mx-auto w-full max-w-md text-center">
        <CardHeader className="flex flex-col items-center space-y-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-8 w-8"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12a9.75 9.75 0 1 1 19.5 0 9.75 9.75 0 0 1-19.5 0Zm13.36-1.814a.75.75 0 1 0-1.06-1.06l-3.97 3.97-1.97-1.97a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l4.5-4.5Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
          <CardDescription>
            Your email address has been successfully confirmed.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You can now log in to access all features of SalesPilot.
          </p>
          <Button className="w-full" asChild>
            <Link href="/login">Continue to Login →</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
