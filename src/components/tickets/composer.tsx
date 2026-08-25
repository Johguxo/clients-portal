"use client";

import { useRef, useState, useTransition } from "react";
import { postMessage } from "@/app/(app)/tickets/actions";

export function Composer({ ticketId }: { ticketId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      await postMessage(formData);
      setValue("");
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={submit} className="space-y-2">
      <input type="hidden" name="ticket_id" value={ticketId} />
      <textarea
        name="body"
        rows={3}
        required
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            formRef.current?.requestSubmit();
          }
        }}
        placeholder="Escribe un mensaje…  (⌘/Ctrl + Enter para enviar)"
        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-subtle-foreground focus:border-primary"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending || value.trim() === ""}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Enviando…" : "Enviar"}
        </button>
      </div>
    </form>
  );
}
