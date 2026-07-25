import type { ReactNode } from "react";
import { DigitalHeroesAttribution } from "@/components/digital-heroes-attribution";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-10 sm:py-16">
        {children}
      </main>
      <footer className="border-t px-4 py-4">
        <DigitalHeroesAttribution />
      </footer>
    </div>
  );
}
