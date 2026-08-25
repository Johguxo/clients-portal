import {
  PRIORITY_META,
  STATUS_META,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/domain";
import { formatDateTime } from "@/lib/format";
import type { TimelineEvent } from "@/lib/tickets";

function statusLabel(v: string | null) {
  return v ? (STATUS_META[v as TicketStatus]?.label ?? v) : "—";
}
function priorityLabel(v: string | null) {
  return v ? (PRIORITY_META[v as TicketPriority]?.label ?? v) : "—";
}

function describe(
  ev: TimelineEvent,
  names: Record<string, string>,
): React.ReactNode {
  const actor = ev.actor?.full_name ?? "Alguien";
  switch (ev.type) {
    case "created":
      return (
        <>
          <b className="font-medium text-foreground">{actor}</b> abrió el ticket
        </>
      );
    case "reopened":
      return (
        <>
          <b className="font-medium text-foreground">{actor}</b> reabrió el ticket
        </>
      );
    case "status_changed":
      return (
        <>
          <b className="font-medium text-foreground">{actor}</b> cambió el estado
          a <b className="font-medium text-foreground">{statusLabel(ev.to_value)}</b>
        </>
      );
    case "priority_changed":
      return (
        <>
          <b className="font-medium text-foreground">{actor}</b> cambió la
          prioridad a{" "}
          <b className="font-medium text-foreground">{priorityLabel(ev.to_value)}</b>
        </>
      );
    case "assigned": {
      const to = ev.to_value ? names[ev.to_value] : null;
      return (
        <>
          <b className="font-medium text-foreground">{actor}</b>{" "}
          {to ? (
            <>
              asignó el ticket a{" "}
              <b className="font-medium text-foreground">{to}</b>
            </>
          ) : (
            "dejó el ticket sin asignar"
          )}
        </>
      );
    }
    default:
      return actor;
  }
}

export function Timeline({
  events,
  names,
}: {
  events: TimelineEvent[];
  names: Record<string, string>;
}) {
  if (events.length === 0) return null;

  return (
    <ol className="relative space-y-4 pl-5">
      <span className="absolute top-1 bottom-1 left-[3px] w-px bg-border" />
      {events.map((ev) => (
        <li key={ev.id} className="relative">
          <span className="absolute top-1.5 -left-5 h-[7px] w-[7px] rounded-full bg-border-strong ring-2 ring-surface" />
          <p className="text-sm text-muted-foreground">{describe(ev, names)}</p>
          <time className="text-xs text-subtle-foreground">
            {formatDateTime(ev.created_at)}
          </time>
        </li>
      ))}
    </ol>
  );
}
