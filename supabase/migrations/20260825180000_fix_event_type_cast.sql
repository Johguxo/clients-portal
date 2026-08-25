-- =============================================================================
-- Fix: el evento de cambio de estado se calculaba con un CASE, que devuelve
-- `text`. Postgres no castea text -> enum implícitamente (solo literales), así
-- que el INSERT en ticket_events fallaba (42804) y el cambio de estado no se
-- aplicaba. Añadimos un cast explícito a ticket_event_type.
-- =============================================================================

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
      (case when old.status in ('resolved', 'closed') and new.status = 'open'
            then 'reopened' else 'status_changed' end)::public.ticket_event_type,
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
