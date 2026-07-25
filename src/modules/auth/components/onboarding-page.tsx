"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
  createWorkspaceAction,
  renameOrganizationAction,
} from "@/app/(auth)/onboarding/actions";
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

interface OnboardingPageProps {
  /** True when the user has no organization membership. */
  missingOrganization?: boolean;
}

export function OnboardingPage({
  missingOrganization = false,
}: OnboardingPageProps) {
  const router = useRouter();
  const [organization, setOrganization] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createWorkspaceAction(organization);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Workspace created");
      router.push("/dashboard");
      router.refresh();
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
      router.push("/login");
      router.refresh();
    } catch (_err) {
      toast.error("Error signing out");
      setIsSigningOut(false);
    }
  };

  if (missingOrganization) {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            No workspace found
          </CardTitle>
          <CardDescription>
            You are not part of an organization yet. Create your own workspace
            to continue, or log out if you expected an invite.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Workspace name</Label>
              <Input
                id="organization"
                placeholder="Acme Inc."
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                disabled={isLoading || isSigningOut}
              />
            </div>
            <Button
              className="w-full"
              type="submit"
              disabled={isLoading || isSigningOut}
            >
              {isLoading ? "Creating..." : "Create workspace"}
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
