"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { completeOnboardingAction } from "@/app/(auth)/onboarding/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

/**
 * Onboarding wizard — shown exclusively to users with onboardingState === "PENDING".
 *
 * This covers:
 *   - Brand-new Google OAuth users (never entered an org name).
 *   - Users who started signup and abandoned the flow.
 *
 * It is NOT used for users who completed onboarding but lost their org
 * (those go to /no-organization instead).
 */
export function OnboardingPage() {
  const router = useRouter();
  const [organization, setOrganization] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await completeOnboardingAction(organization);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Organization created — welcome to SalesPilot!");
      window.location.href = "/dashboard";
    } catch (_err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      window.location.href = "/login";
    } catch (_err) {
      toast.error("Error signing out");
      setIsSigningOut(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          Welcome to SalesPilot!
        </CardTitle>
        <CardDescription>
          Name your organization to finish setting up your workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleCompleteOnboarding} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organization">Organization Name</Label>
            <Input
              id="organization"
              placeholder="Acme Inc."
              required
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Continue to Dashboard"}
          </Button>
        </form>
        <Button
          className="w-full"
          type="button"
          variant="outline"
          onClick={handleSignOut}
          disabled={isLoading || isSigningOut}
        >
          {isSigningOut ? "Signing out..." : "Log out"}
        </Button>
      </CardContent>
    </Card>
  );
}
