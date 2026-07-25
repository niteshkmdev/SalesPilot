import type { ReactNode } from "react";

/** Full-width like Leads/Dashboard; form pages add their own max-width. */
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
