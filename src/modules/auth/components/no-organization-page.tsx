"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { createWorkspaceAction } from "@/app/(auth)/onboarding/actions";
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
 * Recovery page for existing users (onboardingState === "COMPLETED") who
 * currently have zero active organization memberships.
 *
 * This covers:
 *   - Users who were removed from their organization.
 *   - Users whose organization was deleted.
 *   - Any other scenario where a previously-onboarded user has no org.
 *
 * This is NOT the onboarding wizard. Onboarding is already complete.
 * This page only recovers the missing organization state.
 *
 * Note: joining an existing organization is handled via invitation links,
 * not through this page.
 */
export function NoOrganizationPage() {
  const router = useRouter();
  const [organization, setOrganization] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createWorkspaceAction(organization);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Workspace created");
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
        <CardTitle className="text-2xl font-bold">No workspace found</CardTitle>
        <CardDescription>
          You are not part of any organization. Create a new workspace to
          continue, or log out if you are expecting an invitation.
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
