"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { renameOrganizationAction } from "@/app/(auth)/onboarding/actions";
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

interface OnboardingPageProps {
  /** True when signup provision hook did not create a membership. */
  missingOrganization?: boolean;
}

export function OnboardingPage({
  missingOrganization = false,
}: OnboardingPageProps) {
  const router = useRouter();
  const [organization, setOrganization] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRenameOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await renameOrganizationAction(organization);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Organization ready");
      router.push("/dashboard");
      router.refresh();
    } catch (_err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (missingOrganization) {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            Workspace not ready
          </CardTitle>
          <CardDescription>
            Your organization was not created during signup. Refresh this page
            or contact support if the problem continues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            type="button"
            onClick={() => router.refresh()}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

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
        <form onSubmit={handleRenameOrganization} className="space-y-4">
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
      </CardContent>
    </Card>
  );
}
