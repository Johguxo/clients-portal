import { cn } from "@/lib/cn";

/** Marca de Órbita: un cuerpo central con un satélite en órbita. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("h-7 w-7", className)}
      aria-hidden="true"
    >
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="7"
        transform="rotate(-30 16 16)"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <circle cx="16" cy="16" r="5" fill="currentColor" />
      <circle cx="27" cy="9.5" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function Logo({
  className,
  withText = true,
}: {
  className?: string;
  withText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-primary", className)}>
      <LogoMark />
      {withText && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Órbita
        </span>
      )}
    </span>
  );
}
