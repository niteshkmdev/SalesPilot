import { Building, User, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 p-2 md:p-6 pb-16">
      <aside className="-mx-4 lg:w-1/5">
        <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
          <Link
            href="/settings/profile"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          <Link
            href="/settings/organization"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <Building className="h-4 w-4" />
            Organization
          </Link>
          <Link
            href="/settings/members"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <Users className="h-4 w-4" />
            Members
          </Link>
        </nav>
      </aside>
      <div className="flex-1 lg:max-w-2xl">{children}</div>
    </div>
  );
}
