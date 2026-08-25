import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import {
  getTicket,
  getThread,
  getTimeline,
  listAgents,
} from "@/lib/tickets";
import {
  StatusBadge,
  PriorityBadge,
  TypeLabel,
  AwaitingBadge,
} from "@/components/ui/badge";
import { awaitingParty } from "@/lib/domain";
import { Avatar } from "@/components/ui/avatar";
import { Timeline } from "@/components/tickets/timeline";
import { MessageThread } from "@/components/tickets/message-thread";
import { Composer } from "@/components/tickets/composer";
import {
  AgentControls,
  ClientControls,
} from "@/components/tickets/ticket-controls";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Ticket" };

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  const ticket = await getTicket(id);
  if (!ticket) notFound();

  const [thread, timeline, agents] = await Promise.all([
    getThread(id),
    getTimeline(id),
    session.isAgent ? listAgents() : Promise.resolve([]),
  ]);

  // Mapa id -> nombre para resolver los eventos de asignación del timeline.
  const names: Record<string, string> = {};
  for (const a of agents) if (a.full_name) names[a.id] = a.full_name;
  if (ticket.author?.id && ticket.author.full_name)
    names[ticket.author.id] = ticket.author.full_name;
  if (ticket.assignee?.id && ticket.assignee.full_name)
    names[ticket.assignee.id] = ticket.assignee.full_name;

  return (
    <div>
      <Link
        href="/tickets"
        className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        ← Tickets
      </Link>

      {/* Cabecera */}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-subtle-foreground">
              #{ticket.number}
            </span>
            <TypeLabel type={ticket.type} />
            {session.isAgent && ticket.organization && (
              <>
                <span className="text-subtle-foreground">·</span>
                <span className="text-xs text-muted-foreground">
                  {ticket.organization.name}
                </span>
              </>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {ticket.subject}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <AwaitingBadge
            party={awaitingParty(ticket)}
            viewerIsAgent={session.isAgent}
          />
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-6 lg:col-span-2">
          {ticket.description && (
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="text-sm whitespace-pre-wrap text-foreground">
                {ticket.description}
              </p>
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs text-subtle-foreground">
                <Avatar
                  name={ticket.author?.full_name}
                  agent={ticket.author?.role === "agent"}
                  size="sm"
                />
                <span>
                  {ticket.author?.full_name ?? "Usuario"} · abrió el ticket{" "}
                  {formatDateTime(ticket.created_at)}
                </span>
              </div>
            </div>
          )}

          <section>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Conversación
            </h2>
            <MessageThread messages={thread} />
            <div className="mt-4">
              <Composer ticketId={ticket.id} />
            </div>
          </section>
        </div>

        {/* Barra lateral */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-foreground">
              {session.isAgent ? "Gestión" : "Acciones"}
            </h2>
            <div className="mt-4">
              {session.isAgent ? (
                <AgentControls
                  ticketId={ticket.id}
                  status={ticket.status}
                  priority={ticket.priority}
                  assignedTo={ticket.assigned_to}
                  agents={agents}
                  currentUserId={session.userId}
                />
              ) : (
                <ClientControls ticketId={ticket.id} status={ticket.status} />
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-foreground">Detalles</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Solicitante</dt>
                <dd className="text-right text-foreground">
                  {ticket.author?.full_name ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Asignado a</dt>
                <dd className="text-right text-foreground">
                  {ticket.assignee?.full_name ?? "Sin asignar"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Creado</dt>
                <dd className="text-right text-foreground">
                  {formatDateTime(ticket.created_at)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Última actividad</dt>
                <dd className="text-right text-foreground">
                  {formatDateTime(ticket.last_activity_at)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              Actividad
            </h2>
            <Timeline events={timeline} names={names} />
          </div>
        </aside>
      </div>
    </div>
  );
}
