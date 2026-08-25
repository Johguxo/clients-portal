import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NewTicketForm } from "@/components/tickets/new-ticket-form";

export const metadata: Metadata = { title: "Nuevo ticket" };

export default async function NewTicketPage() {
  const session = await requireSession();

  // El agente puede abrir tickets en nombre de cualquier organización.
  let organizations: { id: string; name: string }[] | undefined;
  if (session.isAgent) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("organizations")
      .select("id, name")
      .order("name");
    organizations = data ?? [];
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/tickets"
        className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        ← Tickets
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        Nuevo ticket
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Describe tu incidencia o solicitud. Podrás seguir su estado en todo
        momento.
      </p>

      <div className="mt-8">
        <NewTicketForm organizations={organizations} />
      </div>
    </div>
  );
}
