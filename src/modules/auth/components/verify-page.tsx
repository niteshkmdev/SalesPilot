"use client";

import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

// ---------------------------------------------------------------------------
// Oscillating wave polling schedule (milliseconds).
//
// Pattern: immediate → 10s → 20s → 30s → 20s → 10s → 20s → 30s → ...
//
// Index 0 is the initial immediate check (no delay).
// Indices 1–5 cycle indefinitely: [10, 20, 30, 20, 10] seconds.
// ---------------------------------------------------------------------------
const POLL_WAVE_MS = [0, 10_000, 20_000, 30_000, 20_000, 10_000] as const;

function getNextDelay(attempt: number): number {
  if (attempt === 0) return POLL_WAVE_MS[0];
  // After the first attempt, cycle through indices 1–5.
  const waveIdx = ((attempt - 1) % (POLL_WAVE_MS.length - 1)) + 1;
  return POLL_WAVE_MS[waveIdx];
}

// ---------------------------------------------------------------------------
// Inner component (needs useSearchParams — wrapped in Suspense below)
// ---------------------------------------------------------------------------
function VerifyEmailContent() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [pollStatus, setPollStatus] = useState<
    "waiting" | "verified" | "redirecting"
  >("waiting");

  // Read the email param once on mount without importing useSearchParams
  // at the module level (keeps the Suspense boundary clean).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get("email") ?? "");
  }, []);

  // Use a ref so the poll loop closure always has the latest cancellation state.
  const cancelledRef = useRef(false);
  const attemptRef = useRef(0);

  const poll = useCallback(async () => {
    if (cancelledRef.current) return;

    try {
      const session = await authClient.getSession();

      if (session?.data?.user?.emailVerified) {
        // Verification detected — stop polling and redirect through the
        // unified post-auth resolver.
        setPollStatus("verified");
        setTimeout(() => {
          setPollStatus("redirecting");
          router.push("/auth/callback");
        }, 800); // brief pause so the UI can show the verified state
        return;
      }
    } catch {
      // Network error — swallow and retry on next cycle.
    }

    if (!cancelledRef.current) {
      const delay = getNextDelay(attemptRef.current);
      attemptRef.current += 1;
      setTimeout(poll, delay);
    }
  }, [router]);

  useEffect(() => {
    cancelledRef.current = false;
    attemptRef.current = 0;
    poll(); // attempt 0 — fires immediately

    return () => {
      cancelledRef.current = true;
    };
  }, [poll]);

  const handleResend = async () => {
    if (!email) {
      toast.error("Email is missing. Please sign up again.");
      return;
    }

    setIsResending(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/verify/confirmed",
      });

      if (error) {
        toast.error(error.message || "Failed to resend verification email.");
      } else {
        toast.success("Verification email sent! Check your inbox.");
      }
    } catch (_err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsResending(false);
    }
  };

  const isVerified = pollStatus === "verified" || pollStatus === "redirecting";

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="flex flex-col items-center space-y-1 text-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
        <CardDescription>
          We&apos;ve sent a verification link to{" "}
          {email ? (
            <>
              <br />
              <span className="font-semibold text-foreground">{email}</span>
            </>
          ) : (
            "your email address"
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isVerified ? (
          <div className="flex flex-col items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <span className="font-medium">✓ Email verified!</span>
            <span className="text-sm">Redirecting you now…</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Waiting for verification…</span>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Click the link in the email to verify your account. If you don&apos;t
          see it, check your spam folder.
        </p>

        <Button
          className="w-full"
          onClick={handleResend}
          disabled={isResending || !email || isVerified}
          variant="outline"
        >
          {isResending ? "Sending…" : "Resend Verification Email"}
        </Button>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2">
        <div className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Public export — wrapped in Suspense for useSearchParams compatibility
// ---------------------------------------------------------------------------
export function VerifyPage() {
  return (
    <Suspense
      fallback={<div className="flex justify-center p-8">Loading…</div>}
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
