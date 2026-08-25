import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Acceder" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">
      {/* Panel de marca — transmite el mensaje del producto */}
      <aside className="relative hidden w-1/2 overflow-hidden bg-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, var(--color-primary) 0%, transparent 45%), radial-gradient(circle at 80% 70%, #7c3aed 0%, transparent 40%)",
          }}
        />
        <div className="relative">
          <Logo className="[&_span]:text-white" />
        </div>
        <div className="relative max-w-md">
          <p className="text-2xl leading-snug font-medium text-white">
            Cada solicitud, en su sitio.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            El espacio donde tus clientes ven el estado de cada incidencia sin
            tener que preguntar. Transparencia y orden, en lugar de un grupo de
            WhatsApp.
          </p>
        </div>
        <div className="relative text-xs text-white/40">
          Órbita · Portal de cliente
        </div>
      </aside>

      {/* Formulario */}
      <section className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
