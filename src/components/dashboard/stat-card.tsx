import Link from "next/link";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  accent = "neutral",
  href,
}: {
  label: string;
  value: number;
  accent?: "neutral" | "primary" | "urgent" | "waiting" | "resolved";
  href?: string;
}) {
  const accentClass = {
    neutral: "text-foreground",
    primary: "text-status-open",
    urgent: "text-priority-urgent",
    waiting: "text-status-waiting",
    resolved: "text-status-resolved",
  }[accent];

  const inner = (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-5 transition",
        href && "hover:border-border-strong hover:shadow-sm",
      )}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn("mt-2 text-3xl font-semibold tracking-tight", accentClass)}>
        {value}
      </p>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
