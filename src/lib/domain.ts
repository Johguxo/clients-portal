import type { Database } from "./supabase/database.types";

// Tipos de fila derivados del esquema ---------------------------------------
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Ticket = Database["public"]["Tables"]["tickets"]["Row"];
export type TicketMessage =
  Database["public"]["Tables"]["ticket_messages"]["Row"];
export type TicketEvent =
  Database["public"]["Tables"]["ticket_events"]["Row"];

// Enums ----------------------------------------------------------------------
export type UserRole = Database["public"]["Enums"]["user_role"];
export type TicketType = Database["public"]["Enums"]["ticket_type"];
export type TicketPriority = Database["public"]["Enums"]["ticket_priority"];
export type TicketStatus = Database["public"]["Enums"]["ticket_status"];

// Presentación: etiquetas y estilos coherentes en toda la app ----------------

type Meta = { label: string; className: string; dot: string };

export const STATUS_META: Record<TicketStatus, Meta> = {
  open: {
    label: "Abierto",
    className: "bg-status-open-soft text-status-open",
    dot: "bg-status-open",
  },
  in_progress: {
    label: "En progreso",
    className: "bg-status-progress-soft text-status-progress",
    dot: "bg-status-progress",
  },
  resolved: {
    label: "Resuelto",
    className: "bg-status-resolved-soft text-status-resolved",
    dot: "bg-status-resolved",
  },
  closed: {
    label: "Cerrado",
    className: "bg-status-closed-soft text-status-closed",
    dot: "bg-status-closed",
  },
};

export const PRIORITY_META: Record<TicketPriority, Meta> = {
  low: {
    label: "Baja",
    className: "bg-surface-muted text-priority-low",
    dot: "bg-priority-low",
  },
  medium: {
    label: "Media",
    className: "bg-primary-soft text-priority-medium",
    dot: "bg-priority-medium",
  },
  high: {
    label: "Alta",
    className: "bg-priority-high-soft text-priority-high",
    dot: "bg-priority-high",
  },
  urgent: {
    label: "Urgente",
    className: "bg-priority-urgent-soft text-priority-urgent",
    dot: "bg-priority-urgent",
  },
};

export const TYPE_META: Record<TicketType, { label: string; className: string }> =
  {
    incident: { label: "Incidencia", className: "text-type-incident" },
    question: { label: "Duda", className: "text-type-question" },
    request: { label: "Solicitud", className: "text-type-request" },
  };

// Orden de trabajo: estados abiertos primero, cerrados al final.
export const STATUS_ORDER: TicketStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
];

export const PRIORITY_ORDER: TicketPriority[] = [
  "urgent",
  "high",
  "medium",
  "low",
];

/** Un estado se considera "activo" (pendiente) si no está resuelto ni cerrado. */
export const ACTIVE_STATUSES: TicketStatus[] = ["open", "in_progress"];

export function isActiveStatus(status: TicketStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

// "De quién es la pelota" — derivado del último mensaje, no un estado manual.
// - Si el último en responder fue el staff  -> esperamos al cliente.
// - Si respondió el cliente (o aún nadie)    -> la pelota es del staff.
export type AwaitingParty = "client" | "agent";

export function awaitingParty(ticket: {
  status: TicketStatus;
  last_reply_by: UserRole | null;
}): AwaitingParty | null {
  if (!isActiveStatus(ticket.status)) return null;
  return ticket.last_reply_by === "agent" ? "client" : "agent";
}

/** Iniciales para el avatar a partir del nombre. */
export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
