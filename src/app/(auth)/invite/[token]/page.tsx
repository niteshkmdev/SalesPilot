import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AcceptInviteButton } from "@/modules/auth/components/accept-invite-button";
import type { PublicInvitationDto } from "@/modules/organizations/dto/invitation.dto";
import { getPublicInvitation } from "@/modules/organizations/services/invitation.service";
import { auth } from "@/server/auth/auth";
import { AppError } from "@/shared/api/errors";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let invitation: PublicInvitationDto | null;
  try {
    invitation = await getPublicInvitation(token);
  } catch (error) {
    if (error instanceof AppError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  if (!invitation) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const emailMatches =
    session?.user?.email?.trim().toLowerCase() ===
    invitation.email.trim().toLowerCase();

  const signupHref = `/signup?token=${encodeURIComponent(token)}`;
  const loginHref = `/login?token=${encodeURIComponent(token)}`;
  const isInactive =
    invitation.isAccepted || invitation.isExpired || invitation.isRevoked;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Join {invitation.organizationName}
        </CardTitle>
        <CardDescription>
          You&apos;ve been invited as <strong>{invitation.roleName}</strong>
          {" · "}
          {invitation.email}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
        {invitation.isAccepted ? (
          <p>This invitation has already been accepted.</p>
        ) : null}
        {invitation.isRevoked && !invitation.isAccepted ? (
          <p>This invitation has been revoked. Ask an admin to resend it.</p>
        ) : null}
        {invitation.isExpired && !invitation.isAccepted ? (
          <p>This invitation has expired. Ask an admin to resend it.</p>
        ) : null}
        {!isInactive ? (
          <p>
            Expires{" "}
            {new Date(invitation.expiresAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            .
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        {!isInactive ? (
          session?.user ? (
            emailMatches ? (
              <AcceptInviteButton token={token} />
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Signed in as {session.user.email}. Sign in with{" "}
                {invitation.email} to accept.
              </p>
            )
          ) : (
            <>
              <Button asChild className="w-full">
                <Link href={signupHref}>Create account</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={loginHref}>Sign in</Link>
              </Button>
            </>
          )
        ) : (
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Go to login</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
