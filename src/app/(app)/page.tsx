import { requireSession } from "@/lib/auth";

export default async function DashboardPage() {
  const { profile, organization, isAgent } = await requireSession();

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {isAgent ? "Panel de la consultora" : organization?.name}
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        Hola, {profile.full_name?.split(" ")[0]}
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        El panel con el resumen llega en la siguiente fase.
      </p>
    </div>
  );
}
