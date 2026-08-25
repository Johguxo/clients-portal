import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { listTickets, type TicketFilters } from "@/lib/tickets";
import { FilterBar } from "@/components/tickets/filter-bar";
import { TicketRow } from "@/components/tickets/ticket-row";
import type { TicketPriority, TicketStatus, TicketType } from "@/lib/domain";

export const metadata: Metadata = { title: "Tickets" };

type SearchParams = {
  status?: string;
  priority?: string;
  type?: string;
  q?: string;
  assigned?: string;
};

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireSession();
  const sp = await searchParams;

  const filters: TicketFilters = {
    status: (sp.status as TicketStatus) || undefined,
    priority: (sp.priority as TicketPriority) || undefined,
    type: (sp.type as TicketType) || undefined,
    q: sp.q || undefined,
    assignedToMe: session.isAgent && sp.assigned === "me",
  };

  const tickets = await listTickets(filters, session.userId);
  const hasFilters = Boolean(
    sp.status || sp.priority || sp.type || sp.q || sp.assigned,
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Tickets
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.isAgent
              ? "Todas las solicitudes de tus clientes."
              : "El estado de todas tus incidencias y solicitudes."}
          </p>
        </div>
        <Link
          href="/tickets/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
        >
          Nuevo ticket
        </Link>
      </div>

      <div className="mt-6">
        <FilterBar isAgent={session.isAgent} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
        {tickets.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-foreground">
              {hasFilters
                ? "Ningún ticket coincide con los filtros."
                : "Aún no hay tickets."}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasFilters
                ? "Prueba a ajustar la búsqueda o los filtros."
                : "Crea el primero para empezar a hacer seguimiento."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tickets.map((t) => (
              <TicketRow
                key={t.id}
                ticket={t}
                showOrg={session.isAgent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
