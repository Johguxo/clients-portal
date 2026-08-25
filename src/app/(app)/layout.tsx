import { requireSession } from "@/lib/auth";
import { Avatar } from "@/components/ui/avatar";
import { SidebarBrand, SidebarNav } from "@/components/app/sidebar";
import { signOut } from "./actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, organization, isAgent } = await requireSession();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-surface md:flex">
        <div className="px-5 py-5">
          <SidebarBrand />
        </div>

        <div className="flex-1 px-3">
          <SidebarNav />
        </div>

        {/* Tarjeta de usuario */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar name={profile.full_name} agent={isAgent} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {profile.full_name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {isAgent ? "Consultora · Staff" : organization?.name}
              </p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                title="Cerrar sesión"
                className="rounded-md p-1.5 text-subtle-foreground transition hover:bg-surface-muted hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="M15 12H4m0 0 3.5-3.5M4 12l3.5 3.5M14 5h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex-1 md:pl-64">
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
