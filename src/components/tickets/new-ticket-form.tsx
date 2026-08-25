"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createTicket,
  type CreateTicketState,
} from "@/app/(app)/tickets/actions";
import { PRIORITY_META, PRIORITY_ORDER, TYPE_META } from "@/lib/domain";

const initial: CreateTicketState = { error: null };
const fieldClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-subtle-foreground focus:border-primary";
const labelClass = "text-sm font-medium text-foreground";

const TYPE_HINT: Record<string, string> = {
  incident: "Algo no funciona",
  question: "Tengo una duda",
  request: "Necesito algo nuevo",
};

export function NewTicketForm({
  organizations,
}: {
  organizations?: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createTicket, initial);

  return (
    <form action={formAction} className="space-y-5">
      {organizations && (
        <div className="space-y-1.5">
          <label htmlFor="organization_id" className={labelClass}>
            Organización
          </label>
          <select id="organization_id" name="organization_id" className={fieldClass}>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="subject" className={labelClass}>
          Asunto
        </label>
        <input
          id="subject"
          name="subject"
          required
          maxLength={140}
          placeholder="Resume el tema en una frase"
          className={fieldClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="type" className={labelClass}>
            Tipo
          </label>
          <select id="type" name="type" defaultValue="question" className={fieldClass}>
            {(Object.keys(TYPE_META) as (keyof typeof TYPE_META)[]).map((t) => (
              <option key={t} value={t}>
                {TYPE_META[t].label} — {TYPE_HINT[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="priority" className={labelClass}>
            Prioridad
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue="medium"
            className={fieldClass}
          >
            {PRIORITY_ORDER.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_META[p].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className={labelClass}>
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          placeholder="Cuéntanos qué ocurre, con el detalle que puedas: qué esperabas, qué pasó, desde cuándo…"
          className={fieldClass}
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-priority-urgent-soft px-3 py-2 text-sm text-priority-urgent">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
        >
          {pending ? "Creando…" : "Crear ticket"}
        </button>
        <Link
          href="/tickets"
          className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
