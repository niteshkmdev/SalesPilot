import { env } from "@/server/env";
import { validationFailed } from "@/shared/api/errors";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp?: string | null,
): Promise<void> {
  const secret = env.TURNSTILE_SECRET_KEY;
  const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!secret || !siteKey) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[turnstile] Keys unset — skipping verification (configure TURNSTILE_*).",
      );
    }
    return;
  }

  if (!token?.trim()) {
    throw validationFailed("Please complete the captcha and try again.");
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token.trim());
  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    },
  );

  if (!response.ok) {
    throw validationFailed("Captcha verification failed. Please try again.");
  }

  const result = (await response.json()) as TurnstileVerifyResponse;
  if (!result.success) {
    throw validationFailed("Captcha verification failed. Please try again.");
  }
}

export function getTurnstileSiteKey(): string | null {
  return env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;
}
