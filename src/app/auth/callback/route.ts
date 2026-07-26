import { type NextRequest, NextResponse } from "next/server";
import { resolvePostAuthDestination } from "@/modules/auth/services/post-auth-resolver";
import { auth } from "@/server/auth/auth";

/**
 * Unified post-authentication gateway.
 *
 * Every authentication provider (Google OAuth, email login, email signup after
 * verification) redirects here. This handler resolves the authenticated user's
 * state and issues a single authoritative redirect to the correct destination.
 *
 * No provider-specific routing logic lives outside this handler.
 */
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const destination = await resolvePostAuthDestination(session.user.id);
  return NextResponse.redirect(new URL(destination, req.url));
}
