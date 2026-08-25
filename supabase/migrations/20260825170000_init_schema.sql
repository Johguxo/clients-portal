-- =============================================================================
-- Órbita — Esquema inicial
-- Portal de cliente para consultoras. Multi-tenant por organización.
-- =============================================================================

-- Tipos --------------------------------------------------------------------

create type public.user_role as enum ('client', 'agent');

create type public.ticket_type as enum ('incident', 'question', 'request');

create type public.ticket_priority as enum ('low', 'medium', 'high', 'urgent');

create type public.ticket_status as enum (
  'open',            -- Abierto
  'in_progress',     -- En progreso
  'waiting_client',  -- Esperando al cliente
  'resolved',        -- Resuelto
  'closed'           -- Cerrado
);

create type public.ticket_event_type as enum (
  'created',
  'status_changed',
  'priority_changed',
  'assigned',
  'reopened'
);

-- Tablas -------------------------------------------------------------------

-- Cada organización es un cliente de la consultora (el "tenant").
create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- Extiende auth.users. Un cliente pertenece a una organización; el staff de
-- la consultora (role = 'agent') es global y no tiene organización.
create table public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  organization_id  uuid references public.organizations (id) on delete cascade,
  role             public.user_role not null default 'client',
  full_name        text,
  email            text,
  created_at       timestamptz not null default now(),
  -- Un agente no tiene organización; un cliente siempre la tiene.
  constraint agent_has_no_org check (
    (role = 'agent' and organization_id is null) or
    (role = 'client' and organization_id is not null)
  )
);

-- Incidencia / duda / solicitud de un cliente.
create table public.tickets (
  id               uuid primary key default gen_random_uuid(),
  number           bigint generated always as identity,
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  subject          text not null,
  description      text,
  type             public.ticket_type     not null default 'question',
  priority         public.ticket_priority not null default 'medium',
  status           public.ticket_status   not null default 'open',
  created_by       uuid references public.profiles (id) on delete set null,
  assigned_to      uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);

-- Hilo de conversación del ticket (sustituto del WhatsApp).
create table public.ticket_messages (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references public.tickets (id) on delete cascade,
  author_id   uuid references public.profiles (id) on delete set null,
  body        text not null,
  created_at  timestamptz not null default now()
);

-- Timeline de auditoría del ticket: alimenta la sensación de transparencia.
-- Se rellena vía triggers, no directamente por el usuario.
create table public.ticket_events (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references public.tickets (id) on delete cascade,
  actor_id    uuid references public.profiles (id) on delete set null,
  type        public.ticket_event_type not null,
  from_value  text,
  to_value    text,
  created_at  timestamptz not null default now()
);

-- Índices ------------------------------------------------------------------

create index tickets_organization_id_idx on public.tickets (organization_id);
create index tickets_status_idx          on public.tickets (status);
create index tickets_assigned_to_idx     on public.tickets (assigned_to);
create index tickets_last_activity_idx   on public.tickets (last_activity_at desc);
create index ticket_messages_ticket_idx  on public.ticket_messages (ticket_id, created_at);
create index ticket_events_ticket_idx    on public.ticket_events (ticket_id, created_at);
create index profiles_organization_idx   on public.profiles (organization_id);

-- Funciones auxiliares -----------------------------------------------------
-- SECURITY DEFINER para leer profiles sin recursión de RLS en las políticas.

create or replace function public.current_org()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_agent()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'agent'
  );
$$;

-- Crea el profile automáticamente al registrarse un usuario en auth.users.
-- Lee role / organization_id / full_name de los metadatos del usuario.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, organization_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'client'),
    nullif(new.raw_user_meta_data ->> 'organization_id', '')::uuid
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mantiene updated_at / last_activity_at al día.
create or replace function public.touch_ticket()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  new.last_activity_at := now();
  return new;
end;
$$;

create trigger tickets_touch
  before update on public.tickets
  for each row execute function public.touch_ticket();

-- Registra eventos del ciclo de vida del ticket en el timeline.
create or replace function public.log_ticket_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.ticket_events (ticket_id, actor_id, type, to_value)
    values (new.id, auth.uid(), 'created', new.status::text);
    return new;
  end if;

  if (new.status is distinct from old.status) then
    insert into public.ticket_events (ticket_id, actor_id, type, from_value, to_value)
    values (
      new.id, auth.uid(),
      case when old.status in ('resolved', 'closed') and new.status = 'open'
           then 'reopened' else 'status_changed' end,
      old.status::text, new.status::text
    );
  end if;

  if (new.priority is distinct from old.priority) then
    insert into public.ticket_events (ticket_id, actor_id, type, from_value, to_value)
    values (new.id, auth.uid(), 'priority_changed', old.priority::text, new.priority::text);
  end if;

  if (new.assigned_to is distinct from old.assigned_to) then
    insert into public.ticket_events (ticket_id, actor_id, type, from_value, to_value)
    values (new.id, auth.uid(), 'assigned', old.assigned_to::text, new.assigned_to::text);
  end if;

  return new;
end;
$$;

create trigger tickets_log_insert
  after insert on public.tickets
  for each row execute function public.log_ticket_event();

create trigger tickets_log_update
  after update on public.tickets
  for each row execute function public.log_ticket_event();

-- Cada mensaje nuevo actualiza la actividad del ticket.
create or replace function public.touch_ticket_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.tickets
  set last_activity_at = now()
  where id = new.ticket_id;
  return new;
end;
$$;

create trigger ticket_messages_touch
  after insert on public.ticket_messages
  for each row execute function public.touch_ticket_on_message();
