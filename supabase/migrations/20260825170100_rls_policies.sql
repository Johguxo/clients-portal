-- =============================================================================
-- Órbita — Row Level Security
-- El aislamiento entre clientes vive aquí, en Postgres, no en el código.
--   · Un CLIENTE solo ve datos de su organización.
--   · Un AGENTE (staff de la consultora) ve todas las organizaciones.
-- =============================================================================

alter table public.organizations   enable row level security;
alter table public.profiles         enable row level security;
alter table public.tickets          enable row level security;
alter table public.ticket_messages  enable row level security;
alter table public.ticket_events    enable row level security;

-- Grants base: la autorización fina la hacen las políticas de abajo.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- organizations ------------------------------------------------------------
-- Un cliente ve su organización; un agente ve todas.
create policy organizations_select on public.organizations
  for select to authenticated
  using (public.is_agent() or id = public.current_org());

-- profiles -----------------------------------------------------------------
-- Ves: tu propio perfil, tus compañeros de organización, y al staff (agentes).
-- Un agente ve todos los perfiles.
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or role = 'agent'
    or public.is_agent()
    or organization_id = public.current_org()
  );

-- Cada quien puede editar su propio perfil (nombre, etc.).
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- tickets ------------------------------------------------------------------
-- Lectura: agentes todo; clientes solo los de su organización.
create policy tickets_select on public.tickets
  for select to authenticated
  using (public.is_agent() or organization_id = public.current_org());

-- Alta: un cliente crea tickets en su organización y como autor;
-- un agente puede crear en cualquier organización.
create policy tickets_insert on public.tickets
  for insert to authenticated
  with check (
    (public.is_agent())
    or (organization_id = public.current_org() and created_by = auth.uid())
  );

-- Edición por agentes: cualquier ticket (estado, prioridad, asignación).
create policy tickets_update_agent on public.tickets
  for update to authenticated
  using (public.is_agent())
  with check (public.is_agent());

-- Edición por clientes: solo tickets de su organización (p. ej. reabrir,
-- añadir contexto). Las reglas por-campo se refuerzan en la capa de servidor.
create policy tickets_update_client on public.tickets
  for update to authenticated
  using (organization_id = public.current_org())
  with check (organization_id = public.current_org());

-- ticket_messages ----------------------------------------------------------
-- Ves los mensajes de los tickets que puedes ver.
create policy ticket_messages_select on public.ticket_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.tickets t
      where t.id = ticket_id
        and (public.is_agent() or t.organization_id = public.current_org())
    )
  );

-- Escribes en el hilo si puedes ver el ticket y firmas como tú mismo.
create policy ticket_messages_insert on public.ticket_messages
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.tickets t
      where t.id = ticket_id
        and (public.is_agent() or t.organization_id = public.current_org())
    )
  );

-- ticket_events ------------------------------------------------------------
-- Solo lectura para los usuarios; los eventos los generan los triggers.
create policy ticket_events_select on public.ticket_events
  for select to authenticated
  using (
    exists (
      select 1 from public.tickets t
      where t.id = ticket_id
        and (public.is_agent() or t.organization_id = public.current_org())
    )
  );
