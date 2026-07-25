import { createAuthClient } from "better-auth/react";

// Using the relative URL or public env var if available.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});
