import { createClient } from "./supabase/server";
import type {
  TicketPriority,
  TicketStatus,
  TicketType,
  UserRole,
} from "./domain";

export type TicketFilters = {
  status?: TicketStatus;
  priority?: TicketPriority;
  type?: TicketType;
  q?: string;
  organizationId?: string;
  assignedToMe?: boolean;
  /** Solo tickets activos donde la pelota es del que mira (pendiente de responder). */
  pendingForViewer?: boolean;
  viewerIsAgent?: boolean;
};

// Fila de listado enriquecida con nombres relacionados y conteo de mensajes.
const LIST_SELECT = `
  id, number, subject, type, priority, status, organization_id,
  created_at, last_activity_at, assigned_to, last_reply_by,
  organization:organizations(name),
  assignee:profiles!tickets_assigned_to_fkey(full_name),
  author:profiles!tickets_created_by_fkey(full_name),
  messages:ticket_messages(count)
` as const;

export type TicketListItem = {
  id: string;
  number: number;
  subject: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  organization_id: string;
  created_at: string;
  last_activity_at: string;
  assigned_to: string | null;
  last_reply_by: UserRole | null;
  organization: { name: string } | null;
  assignee: { full_name: string | null } | null;
  author: { full_name: string | null } | null;
  messages: { count: number }[];
};

export async function listTickets(
  filters: TicketFilters,
  currentUserId: string,
): Promise<TicketListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("tickets")
    .select(LIST_SELECT)
    .order("last_activity_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.priority) query = query.eq("priority", filters.priority);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.organizationId)
    query = query.eq("organization_id", filters.organizationId);
  if (filters.assignedToMe) query = query.eq("assigned_to", currentUserId);
  if (filters.pendingForViewer) {
    query = query.in("status", ["open", "in_progress"]);
    if (filters.viewerIsAgent) {
      // Al staff le toca cuando el cliente escribió lo último (o aún nadie).
      query = query.or("last_reply_by.eq.client,last_reply_by.is.null");
    } else {
      // Al cliente le toca cuando el staff escribió lo último.
      query = query.eq("last_reply_by", "agent");
    }
  }
  if (filters.q) {
    const term = `%${filters.q}%`;
    query = query.or(`subject.ilike.${term},description.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as TicketListItem[];
}

const DETAIL_SELECT = `
  *,
  organization:organizations(id, name),
  assignee:profiles!tickets_assigned_to_fkey(id, full_name, role),
  author:profiles!tickets_created_by_fkey(id, full_name, role)
` as const;

export type TicketDetail = {
  id: string;
  number: number;
  subject: string;
  description: string | null;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  organization_id: string;
  created_by: string | null;
  assigned_to: string | null;
  last_reply_by: UserRole | null;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  organization: { id: string; name: string } | null;
  assignee: { id: string; full_name: string | null; role: string } | null;
  author: { id: string; full_name: string | null; role: string } | null;
};

export type ThreadMessage = {
  id: string;
  body: string;
  created_at: string;
  author_id: string | null;
  author: { full_name: string | null; role: string } | null;
};

export type TimelineEvent = {
  id: string;
  type: string;
  from_value: string | null;
  to_value: string | null;
  created_at: string;
  actor: { full_name: string | null; role: string } | null;
};

export async function getTicket(id: string): Promise<TicketDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as TicketDetail) ?? null;
}

export async function getThread(ticketId: string): Promise<ThreadMessage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ticket_messages")
    .select(
      "id, body, created_at, author_id, author:profiles(full_name, role)",
    )
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });
  return (data ?? []) as unknown as ThreadMessage[];
}

export async function getTimeline(ticketId: string): Promise<TimelineEvent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ticket_events")
    .select(
      "id, type, from_value, to_value, created_at, actor:profiles(full_name, role)",
    )
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });
  return (data ?? []) as unknown as TimelineEvent[];
}

/** Agentes disponibles para asignar tickets. */
export async function listAgents() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "agent")
    .order("full_name");
  return data ?? [];
}
