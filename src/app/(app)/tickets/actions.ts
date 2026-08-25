"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { TicketPriority, TicketStatus, TicketType } from "@/lib/domain";

const TYPES: TicketType[] = ["incident", "question", "request"];
const PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];
const STATUSES: TicketStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
];

export type CreateTicketState = { error: string | null };

export async function createTicket(
  _prev: CreateTicketState,
  formData: FormData,
): Promise<CreateTicketState> {
  const session = await requireSession();
  const supabase = await createClient();

  const subject = String(formData.get("subject") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "question") as TicketType;
  const priority = String(formData.get("priority") ?? "medium") as TicketPriority;

  if (!subject) return { error: "El asunto es obligatorio." };
  if (!TYPES.includes(type) || !PRIORITIES.includes(priority)) {
    return { error: "Tipo o prioridad no válidos." };
  }

  // Un cliente crea en su organización. Un agente debe indicar la organización.
  const organizationId = session.isAgent
    ? String(formData.get("organization_id") ?? "")
    : session.profile.organization_id;

  if (!organizationId) {
    return { error: "Selecciona una organización." };
  }

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      subject,
      description: description || null,
      type,
      priority,
      organization_id: organizationId,
      created_by: session.userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "No se pudo crear el ticket. Inténtalo de nuevo." };
  }

  revalidatePath("/tickets");
  redirect(`/tickets/${data.id}`);
}

export async function postMessage(formData: FormData): Promise<void> {
  const session = await requireSession();
  const supabase = await createClient();

  const ticketId = String(formData.get("ticket_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!ticketId || !body) return;

  await supabase.from("ticket_messages").insert({
    ticket_id: ticketId,
    author_id: session.userId,
    body,
  });

  // "De quién es la pelota" se deriva del último mensaje (last_reply_by, vía
  // trigger). El estado solo avanza cuando el staff atiende un ticket abierto.
  if (session.isAgent) {
    await supabase
      .from("tickets")
      .update({ status: "in_progress" })
      .eq("id", ticketId)
      .eq("status", "open");
  }

  revalidatePath(`/tickets/${ticketId}`);
}

export async function changeStatus(formData: FormData): Promise<void> {
  const session = await requireSession();
  const supabase = await createClient();

  const ticketId = String(formData.get("ticket_id") ?? "");
  const status = String(formData.get("status") ?? "") as TicketStatus;
  if (!ticketId || !STATUSES.includes(status)) return;

  // Regla de negocio: los clientes solo pueden reabrir o cerrar su ticket;
  // los agentes gestionan todo el ciclo. (El aislamiento por org lo cubre RLS.)
  if (!session.isAgent && status !== "open" && status !== "closed") return;

  await supabase.from("tickets").update({ status }).eq("id", ticketId);
  revalidatePath(`/tickets/${ticketId}`);
}

export async function changePriority(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.isAgent) return; // solo staff
  const supabase = await createClient();

  const ticketId = String(formData.get("ticket_id") ?? "");
  const priority = String(formData.get("priority") ?? "") as TicketPriority;
  if (!ticketId || !PRIORITIES.includes(priority)) return;

  await supabase.from("tickets").update({ priority }).eq("id", ticketId);
  revalidatePath(`/tickets/${ticketId}`);
}

export async function assignTicket(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.isAgent) return; // solo staff
  const supabase = await createClient();

  const ticketId = String(formData.get("ticket_id") ?? "");
  const raw = String(formData.get("assigned_to") ?? "");
  const assignedTo = raw === "" ? null : raw;
  if (!ticketId) return;

  await supabase
    .from("tickets")
    .update({ assigned_to: assignedTo })
    .eq("id", ticketId);
  revalidatePath(`/tickets/${ticketId}`);
}
