import { cn } from "@/lib/cn";
import { initials } from "@/lib/domain";

const SIZES = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
};

/**
 * Avatar con iniciales. Color estable derivado del nombre, para que cada
 * persona tenga siempre el mismo tono.
 */
export function Avatar({
  name,
  size = "md",
  agent = false,
  className,
}: {
  name: string | null | undefined;
  size?: keyof typeof SIZES;
  agent?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none",
        agent
          ? "bg-primary text-primary-foreground"
          : "bg-surface-muted text-muted-foreground ring-1 ring-border",
        SIZES[size],
        className,
      )}
      title={name ?? undefined}
    >
      {initials(name)}
    </span>
  );
}
