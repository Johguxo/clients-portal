"use client";

import { useTransition } from "react";
import {
  assignTicket,
  changePriority,
  changeStatus,
} from "@/app/(app)/tickets/actions";
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/domain";
import { cn } from "@/lib/cn";

type Agent = { id: string; full_name: string | null };

const control =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary disabled:opacity-60";

function field(label: string, node: React.ReactNode) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium tracking-wide text-subtle-foreground uppercase">
        {label}
      </span>
      {node}
    </div>
  );
}

export function AgentControls({
  ticketId,
  status,
  priority,
  assignedTo,
  agents,
}: {
  ticketId: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string | null;
  agents: Agent[];
}) {
  const [pending, startTransition] = useTransition();

  function run(action: (fd: FormData) => Promise<void>, entries: [string, string][]) {
    const fd = new FormData();
    fd.set("ticket_id", ticketId);
    for (const [k, v] of entries) fd.set(k, v);
    startTransition(() => action(fd));
  }

  return (
    <div className={cn("space-y-4", pending && "opacity-70")}>
      {field(
        "Estado",
        <select
          className={control}
          value={status}
          disabled={pending}
          onChange={(e) => run(changeStatus, [["status", e.target.value]])}
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </select>,
      )}

      {field(
        "Prioridad",
        <select
          className={control}
          value={priority}
          disabled={pending}
          onChange={(e) => run(changePriority, [["priority", e.target.value]])}
        >
          {PRIORITY_ORDER.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_META[p].label}
            </option>
          ))}
        </select>,
      )}

      {field(
        "Asignado a",
        <select
          className={control}
          value={assignedTo ?? ""}
          disabled={pending}
          onChange={(e) => run(assignTicket, [["assigned_to", e.target.value]])}
        >
          <option value="">Sin asignar</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.full_name}
            </option>
          ))}
        </select>,
      )}
    </div>
  );
}

export function ClientControls({
  ticketId,
  status,
}: {
  ticketId: string;
  status: TicketStatus;
}) {
  const [pending, startTransition] = useTransition();

  function setStatus(next: string) {
    const fd = new FormData();
    fd.set("ticket_id", ticketId);
    fd.set("status", next);
    startTransition(() => changeStatus(fd));
  }

  const canClose = status !== "closed";
  const canReopen = status === "resolved" || status === "closed";

  return (
    <div className="flex flex-col gap-2">
      {canReopen && (
        <button
          onClick={() => setStatus("open")}
          disabled={pending}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary disabled:opacity-60"
        >
          Reabrir ticket
        </button>
      )}
      {canClose && (
        <button
          onClick={() => setStatus("closed")}
          disabled={pending}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted-foreground transition hover:border-border-strong hover:text-foreground disabled:opacity-60"
        >
          Marcar como cerrado
        </button>
      )}
      {!canReopen && !canClose && (
        <p className="text-sm text-muted-foreground">
          Este ticket está cerrado.
        </p>
      )}
    </div>
  );
}
