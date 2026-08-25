import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";
import { timeAgo } from "@/lib/format";
import type { ThreadMessage } from "@/lib/tickets";

export function MessageThread({ messages }: { messages: ThreadMessage[] }) {
  if (messages.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        Aún no hay mensajes. Escribe el primero para iniciar la conversación.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {messages.map((m) => {
        const isAgent = m.author?.role === "agent";
        return (
          <li key={m.id} className="flex gap-3">
            <Avatar name={m.author?.full_name} agent={isAgent} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {m.author?.full_name ?? "Usuario"}
                </span>
                {isAgent && (
                  <span className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
                    Equipo
                  </span>
                )}
                <span className="text-xs text-subtle-foreground">
                  {timeAgo(m.created_at)}
                </span>
              </div>
              <div
                className={cn(
                  "mt-1 rounded-xl px-3.5 py-2.5 text-sm whitespace-pre-wrap text-foreground",
                  isAgent
                    ? "bg-primary-soft/60"
                    : "bg-surface-muted",
                )}
              >
                {m.body}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
