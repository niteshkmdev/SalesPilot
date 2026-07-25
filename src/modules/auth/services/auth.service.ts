import { headers } from "next/headers";

import { type ActiveUser, auth, type Session } from "@/server/auth/auth";
import {
  authenticationRequired,
  emailVerificationRequired,
  organizationRequired,
} from "@/shared/api/errors";

export interface AuthService {
  getSession(): Promise<Session | null>;
  getCurrentUser(): Promise<ActiveUser | null>;
  requireUser(): Promise<ActiveUser>;
  logout(): Promise<void>;
}

export function createAuthService(): AuthService {
  return {
    async getSession() {
      const requestHeaders = await headers();
      return auth.api.getSession({ headers: requestHeaders });
    },
    async getCurrentUser() {
      const session = await this.getSession();
      return session?.user ?? null;
    },
    async requireUser() {
      const user = await this.getCurrentUser();

      if (!user) {
        throw authenticationRequired();
      }

      if (!user.emailVerified) {
        throw emailVerificationRequired();
      }

      return user;
    },
    async logout() {
      const requestHeaders = await headers();
      await auth.api.signOut({ headers: requestHeaders });
    },
  };
}

export function assertHasOrganizationContext<TContext>(
  context: TContext | null,
): TContext {
  if (!context) {
    throw organizationRequired();
  }

  return context;
}

export const authService = createAuthService();
