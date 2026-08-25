import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { listTickets, type TicketListItem } from "@/lib/tickets";
import { isActiveStatus } from "@/lib/domain";
import { StatCard } from "@/components/dashboard/stat-card";
import { TicketRow } from "@/components/tickets/ticket-row";

function Section({
  title,
  hint,
  href,
  tickets,
  showOrg,
  empty,
}: {
  title: string;
  hint?: string;
  href?: string;
  tickets: TicketListItem[];
  showOrg: boolean;
  empty: string;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {href && tickets.length > 0 && (
          <Link
            href={href}
            className="text-xs font-medium text-primary transition hover:text-primary-hover"
          >
            Ver todos →
          </Link>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {tickets.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {empty}
          </p>
        ) : (
          <div className="divide-y divide-border">
            {tickets.map((t) => (
              <TicketRow key={t.id} ticket={t} showOrg={showOrg} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default async function DashboardPage() {
  const session = await requireSession();
  const all = await listTickets({}, session.userId);

  const active = all.filter((t) => isActiveStatus(t.status));
  const recent = all.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {session.isAgent ? "Panel de la consultora" : session.organization?.name}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Hola, {session.profile.full_name?.split(" ")[0]}
          </h1>
        </div>
        <Link
          href="/tickets/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
        >
          Nuevo ticket
        </Link>
      </div>

      {session.isAgent ? (
        <AgentDashboard all={all} active={active} recent={recent} userId={session.userId} />
      ) : (
        <ClientDashboard all={all} active={active} recent={recent} />
      )}
    </div>
  );
}

function ClientDashboard({
  all,
  active,
  recent,
}: {
  all: TicketListItem[];
  active: TicketListItem[];
  recent: TicketListItem[];
}) {
  const waiting = all.filter((t) => t.status === "waiting_client");
  const resolved = all.filter(
    (t) => t.status === "resolved" || t.status === "closed",
  );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Activos" value={active.length} accent="primary" href="/tickets?status=open" />
        <StatCard
          label="Esperan tu respuesta"
          value={waiting.length}
          accent="waiting"
          href="/tickets?status=waiting_client"
        />
        <StatCard label="Resueltos" value={resolved.length} accent="resolved" />
      </div>

      <Section
        title="Necesitan tu respuesta"
        hint="El equipo está esperando información tuya para avanzar."
        tickets={waiting}
        showOrg={false}
        empty="Nada pendiente por tu parte. 🎉"
      />

      <Section
        title="Actividad reciente"
        href="/tickets"
        tickets={recent}
        showOrg={false}
        empty="Aún no has creado ningún ticket."
      />
    </>
  );
}

function AgentDashboard({
  all,
  active,
  recent,
  userId,
}: {
  all: TicketListItem[];
  active: TicketListItem[];
  recent: TicketListItem[];
  userId: string;
}) {
  const unassigned = active.filter((t) => !t.assigned_to);
  const urgent = active.filter((t) => t.priority === "urgent");
  const waitingClient = all.filter((t) => t.status === "waiting_client");
  const mine = active.filter((t) => t.assigned_to === userId);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sin asignar" value={unassigned.length} accent="primary" />
        <StatCard label="Urgentes activos" value={urgent.length} accent="urgent" />
        <StatCard label="Asignados a mí" value={mine.length} href="/tickets?assigned=me" />
        <StatCard label="Esperando cliente" value={waitingClient.length} accent="waiting" />
      </div>

      <Section
        title="Sin asignar"
        hint="Tickets activos que aún no tienen responsable."
        href="/tickets"
        tickets={unassigned}
        showOrg
        empty="Todo el trabajo activo tiene responsable. 👌"
      />

      <Section
        title="Asignados a mí"
        href="/tickets?assigned=me"
        tickets={mine}
        showOrg
        empty="No tienes tickets activos asignados."
      />

      <Section
        title="Actividad reciente"
        href="/tickets"
        tickets={recent}
        showOrg
        empty="Aún no hay tickets."
      />
    </>
  );
}
