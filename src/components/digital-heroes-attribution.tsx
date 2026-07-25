import { cn } from "@/lib/utils";

const DIGITAL_HEROES_URL = "https://digitalheroesco.com";

interface DigitalHeroesAttributionProps {
  className?: string;
}

export function DigitalHeroesAttribution({
  className,
}: DigitalHeroesAttributionProps) {
  return (
    <p className={cn("text-center text-xs text-muted-foreground", className)}>
      <a
        href={DIGITAL_HEROES_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="underline-offset-4 hover:text-foreground hover:underline"
      >
        Built for Digital Heroes Training Task
      </a>
    </p>
  );
}
