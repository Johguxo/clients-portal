import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Organization, Profile } from "./domain";

export type SessionContext = {
  userId: string;
  email: string | null;
  profile: Profile;
  organization: Organization | null;
  isAgent: boolean;
};

/**
 * Obtiene el usuario autenticado junto con su perfil y organización.
 * Redirige a /login si no hay sesión. Úsalo en Server Components y actions.
 */
export async function requireSession(): Promise<SessionContext> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Sesión válida pero sin perfil: estado inconsistente, forzamos salida.
  if (!profile) redirect("/login");

  let organization: Organization | null = null;
  if (profile.organization_id) {
    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", profile.organization_id)
      .single();
    organization = org ?? null;
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    profile,
    organization,
    isAgent: profile.role === "agent",
  };
}
