"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
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

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error("Email is missing. Please sign up again.");
      return;
    }

    setIsLoading(true);
    try {
      // Depending on the exact Better Auth version, it's either under .emailVerification or root
      const sendEmail =
        (authClient as any).emailVerification?.sendVerificationEmail ||
        (authClient as any).sendVerificationEmail;

      if (sendEmail) {
        const { error } = await sendEmail({ email });
        if (error) {
          toast.error(error.message || "Failed to resend verification email.");
        } else {
          toast.success("Verification email sent! Check your inbox.");
        }
      } else {
        toast.error("Verification email method not found.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto w-full">
      <CardHeader className="space-y-1 text-center flex flex-col items-center">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
        <CardDescription>
          We've sent a verification link to <br />
          <span className="font-semibold text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-center text-muted-foreground">
          Click the link in the email to verify your account. If you don't see
          it, check your spam folder.
        </p>
        <Button
          className="w-full"
          onClick={handleResend}
          disabled={isLoading || !email}
          variant="outline"
        >
          {isLoading ? "Sending..." : "Resend Verification Email"}
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm text-muted-foreground">
          Verified your email?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Go to Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export function VerifyPage() {
  return (
    <Suspense
      fallback={<div className="flex justify-center p-8">Loading...</div>}
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
