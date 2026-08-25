-- =============================================================================
-- "De quién es la pelota" deja de ser un estado que se pone a mano y pasa a
-- derivarse del último mensaje. El estado real queda como ciclo de vida puro:
--   open · in_progress · resolved · closed
-- y "esperando respuesta" se calcula a partir de `last_reply_by`.
-- =============================================================================

-- 1. Denormalizamos quién respondió el último mensaje del ticket.
alter table public.tickets
  add column last_reply_by public.user_role;

-- 2. El trigger de mensajes registra también al último en responder.
create or replace function public.touch_ticket_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.tickets
  set last_activity_at = now(),
      last_reply_by = (select role from public.profiles where id = new.author_id)
  where id = new.ticket_id;
  return new;
end;
$$;

-- 3. Migramos los tickets y eventos que usaban 'waiting_client'.
update public.tickets set status = 'in_progress' where status = 'waiting_client';
update public.ticket_events set to_value = 'in_progress' where to_value = 'waiting_client';
update public.ticket_events set from_value = 'in_progress' where from_value = 'waiting_client';

-- 4. Recreamos el enum de estado sin 'waiting_client'.
alter type public.ticket_status rename to ticket_status_old;
create type public.ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');
alter table public.tickets alter column status drop default;
alter table public.tickets
  alter column status type public.ticket_status using status::text::public.ticket_status;
alter table public.tickets alter column status set default 'open';
drop type public.ticket_status_old;

-- 5. Backfill de last_reply_by a partir del último mensaje de cada ticket.
update public.tickets t
set last_reply_by = sub.role
from (
  select distinct on (m.ticket_id) m.ticket_id, p.role
  from public.ticket_messages m
  join public.profiles p on p.id = m.author_id
  order by m.ticket_id, m.created_at desc
) sub
where sub.ticket_id = t.id;
