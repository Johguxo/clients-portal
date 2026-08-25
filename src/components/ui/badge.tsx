import { cn } from "@/lib/cn";
import {
  PRIORITY_META,
  STATUS_META,
  TYPE_META,
  type TicketPriority,
  type TicketStatus,
  type TicketType,
} from "@/lib/domain";

function Pill({
  className,
  dot,
  children,
}: {
  className: string;
  dot?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        className,
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  const meta = STATUS_META[status];
  return (
    <Pill className={meta.className} dot={meta.dot}>
      {meta.label}
    </Pill>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const meta = PRIORITY_META[priority];
  return (
    <Pill className={meta.className} dot={meta.dot}>
      {meta.label}
    </Pill>
  );
}

export function TypeLabel({ type }: { type: TicketType }) {
  const meta = TYPE_META[type];
  return (
    <span className={cn("text-xs font-medium", meta.className)}>{meta.label}</span>
  );
}
