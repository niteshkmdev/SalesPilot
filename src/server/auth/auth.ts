import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { provisionOrganizationForUser } from "@/modules/organizations/services/provisioning.service";
import { prisma } from "@/server/db/prisma";
import { sendEmail } from "@/server/email/mailer";
import { env } from "@/server/env";

/**
 * Central Better Auth instance.
 *
 * Configured with:
 *  - Prisma adapter (MongoDB)
 *  - Email + Password provider with email verification and password reset
 *  - Google OAuth provider
 *  - Secure, production-ready session and cookie configuration
 *  - SMTP email dispatch for verification and password-reset flows
 */
export const auth = betterAuth({
  // ---------------------------------------------------------------------------
  // Core
  // ---------------------------------------------------------------------------
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  // ---------------------------------------------------------------------------
  // Database
  // ---------------------------------------------------------------------------
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const { redeemPendingInvitationForNewUser } = await import(
              "@/modules/organizations/services/invitation.service"
            );
            const redeemed = await redeemPendingInvitationForNewUser({
              id: user.id,
              email: user.email,
            });
            if (redeemed) return;

            await provisionOrganizationForUser({
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image ?? null,
              emailVerified: Boolean(user.emailVerified),
            });
          } catch (error) {
            console.error("Failed to provision or redeem invitation:", error);
          }
        },
      },
    },
  },

  // ---------------------------------------------------------------------------
  // Session
  // ---------------------------------------------------------------------------
  session: {
    /**
     * Rolling sessions — each authenticated request resets the expiry window.
     * The cookie is refreshed if there is less than `updateAge` time left on it.
     */
    expiresIn: 60 * 60 * 24 * 30, // 30 days in seconds
    updateAge: 60 * 60 * 24, // Refresh when < 1 day remains
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // Cache for 5 minutes to reduce DB lookups
    },
  },

  // ---------------------------------------------------------------------------
  // Cookie Configuration
  // ---------------------------------------------------------------------------
  advanced: {
    /**
     * Use `__Secure-` prefixed cookies in production.
     * In development the standard `better-auth` prefix is used so that
     * cookies work on plain http://localhost without HTTPS.
     */
    useSecureCookies: env.NODE_ENV === "production",

    /**
     * Cross-site request forgery protection.
     * SameSite=Lax is the recommended default — it allows top-level navigations
     * (e.g. OAuth redirects) while blocking cross-site form submissions.
     */
    cookiePrefix: "salespilot",
    crossSubDomainCookies: {
      enabled: false,
    },
  },

  // ---------------------------------------------------------------------------
  // User profile (additional fields) + account linking
  // ---------------------------------------------------------------------------
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      gender: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      allowDifferentEmails: false,
    },
  },

  // ---------------------------------------------------------------------------
  // Email + Password provider
  // ---------------------------------------------------------------------------
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,

    /**
     * Users must verify their email before they can sign in.
     * Google OAuth users are considered pre-verified.
     */
    requireEmailVerification: true,

    /**
     * Better Auth calls this when the user requests a password reset link.
     * The URL is constructed from `BETTER_AUTH_URL` internally; we receive
     * it here and forward it to the user via SMTP.
     */
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your SalesPilot password",
        html: buildPasswordResetEmailHtml({ name: user.name, url }),
        text: `Reset your password: ${url}`,
      });
    },
  },

  // ---------------------------------------------------------------------------
  // Email Verification
  // ---------------------------------------------------------------------------
  emailVerification: {
    /**
     * Send a verification email automatically after sign-up.
     */
    sendOnSignUp: true,

    /**
     * Allow re-sending the verification email on sign-in if the address
     * has not been verified yet.
     */
    sendOnSignIn: true,

    /**
     * Automatically sign the user in after they verify their email.
     */
    autoSignInAfterVerification: true,

    expiresIn: 60 * 60 * 24, // 24 hours

    /**
     * Better Auth calls this to deliver the verification link.
     */
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your SalesPilot email address",
        html: buildVerificationEmailHtml({ name: user.name, url }),
        text: `Verify your email: ${url}`,
      });
    },
  },

  // ---------------------------------------------------------------------------
  // Social providers
  // ---------------------------------------------------------------------------
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },

  // ---------------------------------------------------------------------------
  // Trusted origins
  // ---------------------------------------------------------------------------
  trustedOrigins: [env.BETTER_AUTH_URL],
});

// ---------------------------------------------------------------------------
// Inferred types — exported so other modules can type auth return values
// without importing Better Auth directly.
// ---------------------------------------------------------------------------
export type Session = typeof auth.$Infer.Session;
export type ActiveSession = typeof auth.$Infer.Session.session;
export type ActiveUser = typeof auth.$Infer.Session.user;

// ---------------------------------------------------------------------------
// Minimal email templates (plain HTML without external dependencies).
// These can be replaced with proper React Email templates later.
// ---------------------------------------------------------------------------

function buildVerificationEmailHtml(params: {
  name: string;
  url: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    @media (prefers-color-scheme: dark) {
      body, .body-bg { background-color: #030712 !important; }
      .container { background-color: #111827 !important; border: 1px solid #374151 !important; }
      h1, .text-heading { color: #f9fafb !important; }
      p, .text-body { color: #d1d5db !important; }
      .button { background-color: #6366f1 !important; color: #ffffff !important; border: 1px solid #6366f1 !important; }
      .footer-text { color: #6b7280 !important; border-top-color: #374151 !important; }
    }
    @media (max-width: 480px) {
      .body-bg { padding: 16px 8px !important; }
      .container { padding: 32px 16px !important; }
      h1 { font-size: 20px !important; }
      .button-wrapper { text-align: center !important; }
      .button { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body class="body-bg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px;">
  <div class="container" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <h1 class="text-heading" style="font-size: 24px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 24px; text-align: left;">
      Verify your email address
    </h1>
    <p class="text-body" style="color: #4b5563; font-size: 16px; line-height: 24px; margin-top: 0; margin-bottom: 16px;">
      Hi ${escapeHtml(params.name)},
    </p>
    <p class="text-body" style="color: #4b5563; font-size: 16px; line-height: 24px; margin-top: 0; margin-bottom: 16px;">
      Thank you for signing up for SalesPilot. Please verify your email address by clicking the button below.
    </p>
    <div class="button-wrapper" style="text-align: left; margin-top: 32px; margin-bottom: 32px;">
      <a href="${params.url}" class="button" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; text-align: center;">
        Verify email
      </a>
    </div>
    <p class="footer-text" style="color: #9ca3af; font-size: 14px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; line-height: 20px;">
      This link expires in 24 hours. If you didn&apos;t create an account, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`.trim();
}

function buildPasswordResetEmailHtml(params: {
  name: string;
  url: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    @media (prefers-color-scheme: dark) {
      body, .body-bg { background-color: #030712 !important; }
      .container { background-color: #111827 !important; border: 1px solid #374151 !important; }
      h1, .text-heading { color: #f9fafb !important; }
      p, .text-body { color: #d1d5db !important; }
      .button { background-color: #6366f1 !important; color: #ffffff !important; border: 1px solid #6366f1 !important; }
      .footer-text { color: #6b7280 !important; border-top-color: #374151 !important; }
    }
    @media (max-width: 480px) {
      .body-bg { padding: 16px 8px !important; }
      .container { padding: 32px 16px !important; }
      h1 { font-size: 20px !important; }
      .button-wrapper { text-align: center !important; }
      .button { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body class="body-bg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px;">
  <div class="container" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <h1 class="text-heading" style="font-size: 24px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 24px; text-align: left;">
      Reset your password
    </h1>
    <p class="text-body" style="color: #4b5563; font-size: 16px; line-height: 24px; margin-top: 0; margin-bottom: 16px;">
      Hi ${escapeHtml(params.name)},
    </p>
    <p class="text-body" style="color: #4b5563; font-size: 16px; line-height: 24px; margin-top: 0; margin-bottom: 16px;">
      We received a request to reset your SalesPilot password. Click the button below to choose a new one.
    </p>
    <div class="button-wrapper" style="text-align: left; margin-top: 32px; margin-bottom: 32px;">
      <a href="${params.url}" class="button" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; text-align: center;">
        Reset password
      </a>
    </div>
    <p class="footer-text" style="color: #9ca3af; font-size: 14px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; line-height: 20px;">
      If you didn&apos;t request a password reset you can safely ignore this email. This link expires in 1 hour.
    </p>
  </div>
</body>
</html>`.trim();
}

/** Minimal HTML escape to prevent XSS in template strings. */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
