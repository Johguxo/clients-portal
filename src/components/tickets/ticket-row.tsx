import Link from "next/link";
import {
  StatusBadge,
  PriorityBadge,
  TypeLabel,
  AwaitingBadge,
} from "@/components/ui/badge";
import { timeAgo } from "@/lib/format";
import { awaitingParty } from "@/lib/domain";
import type { TicketListItem } from "@/lib/tickets";

export function TicketRow({
  ticket,
  showOrg,
  viewerIsAgent,
}: {
  ticket: TicketListItem;
  showOrg: boolean;
  viewerIsAgent: boolean;
}) {
  const messageCount = ticket.messages?.[0]?.count ?? 0;
  const awaiting = awaitingParty(ticket);

  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="group flex items-center gap-4 px-4 py-3.5 transition hover:bg-surface-muted/60"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-subtle-foreground">
            #{ticket.number}
          </span>
          <TypeLabel type={ticket.type} />
          {showOrg && ticket.organization && (
            <>
              <span className="text-subtle-foreground">·</span>
              <span className="truncate text-xs text-muted-foreground">
                {ticket.organization.name}
              </span>
            </>
          )}
        </div>
        <p className="mt-0.5 truncate font-medium text-foreground group-hover:text-primary">
          {ticket.subject}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-subtle-foreground">
          <span>Actividad {timeAgo(ticket.last_activity_at)}</span>
          {messageCount > 0 && (
            <>
              <span>·</span>
              <span>
                {messageCount} {messageCount === 1 ? "mensaje" : "mensajes"}
              </span>
            </>
          )}
          {ticket.assignee?.full_name && (
            <>
              <span>·</span>
              <span>{ticket.assignee.full_name}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <AwaitingBadge party={awaiting} viewerIsAgent={viewerIsAgent} />
        <PriorityBadge priority={ticket.priority} />
        <StatusBadge status={ticket.status} />
      </div>
    </Link>
  );
}
