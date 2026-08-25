import { cn } from "@/lib/cn";
import {
  PRIORITY_META,
  STATUS_META,
  TYPE_META,
  type AwaitingParty,
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

/**
 * Indicador "de quién es la pelota", derivado del último mensaje.
 * El texto depende de quién mira: el staff ve "Sin responder" cuando le toca
 * a él; el cliente ve "Esperando tu respuesta" cuando la pelota es suya.
 */
export function AwaitingBadge({
  party,
  viewerIsAgent,
}: {
  party: AwaitingParty | null;
  viewerIsAgent: boolean;
}) {
  if (!party) return null;

  // La pelota es del staff (el cliente escribió lo último).
  if (party === "agent") {
    if (!viewerIsAgent) return null; // no incordiamos al cliente
    return (
      <Pill className="bg-priority-urgent-soft text-priority-urgent" dot="bg-priority-urgent">
        Sin responder
      </Pill>
    );
  }

  // La pelota es del cliente (el staff escribió lo último).
  return (
    <Pill className="bg-status-waiting-soft text-status-waiting" dot="bg-status-waiting">
      {viewerIsAgent ? "Esperando al cliente" : "Esperando tu respuesta"}
    </Pill>
  );
}
