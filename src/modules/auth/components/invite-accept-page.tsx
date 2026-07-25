"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { acceptInvitationAction } from "@/app/(auth)/invite/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PublicInvitationDto } from "@/modules/organizations/dto/invitation.dto";

interface InviteAcceptPageProps {
  token: string;
  invitation: PublicInvitationDto;
  sessionEmail: string | null;
}

export function InviteAcceptPage({
  token,
  invitation,
  sessionEmail,
}: InviteAcceptPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const emailMatches =
    sessionEmail &&
    sessionEmail.trim().toLowerCase() === invitation.email.trim().toLowerCase();

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const result = await acceptInvitationAction(token);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Welcome to the team");
      router.push("/dashboard");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  if (invitation.isAccepted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invitation already accepted</CardTitle>
          <CardDescription>
            This invitation has already been used. Sign in to continue.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/login">Go to login</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (invitation.isRevoked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invitation revoked</CardTitle>
          <CardDescription>
            This invitation link is no longer valid. Ask an admin to resend an
            invitation to {invitation.email}.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (invitation.isExpired) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invitation expired</CardTitle>
          <CardDescription>
            Ask an admin to resend an invitation to {invitation.email}.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Join {invitation.organizationName}
        </CardTitle>
        <CardDescription>
          You&apos;ve been invited as <strong>{invitation.roleName}</strong> (
          {invitation.email}).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {sessionEmail && emailMatches ? (
          <Button
            type="button"
            className="w-full"
            disabled={isLoading}
            onClick={handleAccept}
          >
            {isLoading ? "Joining..." : "Accept invitation"}
          </Button>
        ) : null}

        {sessionEmail && !emailMatches ? (
          <p className="text-sm text-muted-foreground">
            You&apos;re signed in as {sessionEmail}. Sign out and use{" "}
            {invitation.email} to accept this invite.
          </p>
        ) : null}

        {!sessionEmail ? (
          <>
            <Button asChild className="w-full">
              <Link
                href={`/signup?token=${encodeURIComponent(token)}&email=${encodeURIComponent(invitation.email)}`}
              >
                Create account
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/login?token=${encodeURIComponent(token)}`}>
                Sign in
              </Link>
            </Button>
          </>
        ) : null}
      </CardContent>
      <CardFooter className="justify-center text-xs text-muted-foreground">
        Expires {new Date(invitation.expiresAt).toLocaleString()}
      </CardFooter>
    </Card>
  );
}
