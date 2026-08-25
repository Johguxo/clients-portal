"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  PRIORITY_META,
  STATUS_META,
  STATUS_ORDER,
  PRIORITY_ORDER,
  TYPE_META,
} from "@/lib/domain";
import { cn } from "@/lib/cn";

const selectClass =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary";

export function FilterBar({ isAgent }: { isAgent: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.push(`/tickets?${next.toString()}`));
  }

  const assignedToMe = params.get("assigned") === "me";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 transition-opacity",
        pending && "opacity-60",
      )}
    >
      <input
        type="search"
        defaultValue={params.get("q") ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          // debounce ligero
          window.clearTimeout((window as any).__q);
          (window as any).__q = window.setTimeout(() => setParam("q", v), 300);
        }}
        placeholder="Buscar por asunto…"
        className={cn(selectClass, "w-56 max-w-full")}
      />

      <select
        value={params.get("status") ?? ""}
        onChange={(e) => setParam("status", e.target.value)}
        className={selectClass}
      >
        <option value="">Todos los estados</option>
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS_META[s].label}
          </option>
        ))}
      </select>

      <select
        value={params.get("priority") ?? ""}
        onChange={(e) => setParam("priority", e.target.value)}
        className={selectClass}
      >
        <option value="">Toda prioridad</option>
        {PRIORITY_ORDER.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_META[p].label}
          </option>
        ))}
      </select>

      <select
        value={params.get("type") ?? ""}
        onChange={(e) => setParam("type", e.target.value)}
        className={selectClass}
      >
        <option value="">Todo tipo</option>
        {(Object.keys(TYPE_META) as (keyof typeof TYPE_META)[]).map((t) => (
          <option key={t} value={t}>
            {TYPE_META[t].label}
          </option>
        ))}
      </select>

      {isAgent && (
        <button
          type="button"
          onClick={() => setParam("assigned", assignedToMe ? "" : "me")}
          className={cn(
            "rounded-lg border px-3 py-2 text-sm font-medium transition",
            assignedToMe
              ? "border-primary bg-primary-soft text-primary"
              : "border-border bg-surface text-muted-foreground hover:text-foreground",
          )}
        >
          Asignados a mí
        </button>
      )}
    </div>
  );
}
