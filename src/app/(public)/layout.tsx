import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-xl flex-col px-4 py-10 sm:py-16">
        {children}
      </main>
    </div>
  );
}
