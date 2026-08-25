"use client";

import { useActionState, useState } from "react";
import { login, type LoginState } from "./actions";

const DEMO_ACCOUNTS = [
  { label: "Agente (staff)", email: "ana@orbita.dev", hint: "ve todo" },
  { label: "Cliente · Acme", email: "laura@acme.com", hint: "Acme Corp" },
  { label: "Cliente · Globex", email: "sofia@globex.com", hint: "Globex" },
];

const initial: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initial);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("demo1234");
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Bienvenido de nuevo
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Accede a tu área privada para ver el estado de tus solicitudes.
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@empresa.com"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition placeholder:text-subtle-foreground focus:border-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition placeholder:text-subtle-foreground focus:border-primary"
          />
        </div>

        {state.error && (
          <p className="rounded-lg bg-priority-urgent-soft px-3 py-2 text-sm text-priority-urgent">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
        >
          {pending ? "Accediendo…" : "Acceder"}
        </button>
      </form>

      <div className="mt-8 rounded-xl border border-border bg-surface-muted/60 p-4">
        <p className="text-xs font-medium text-muted-foreground">
          Cuentas de demostración{" "}
          <span className="font-normal text-subtle-foreground">
            · contraseña <code className="font-mono">demo1234</code>
          </span>
        </p>
        <div className="mt-3 space-y-1.5">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => fillDemo(a.email)}
              className="flex w-full items-center justify-between rounded-lg bg-surface px-3 py-2 text-left text-sm ring-1 ring-border transition hover:ring-primary"
            >
              <span className="font-medium text-foreground">{a.label}</span>
              <span className="text-xs text-subtle-foreground">{a.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
