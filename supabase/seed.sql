-- =============================================================================
-- Órbita — Datos de demostración
-- Contraseña de todos los usuarios de demo: demo1234
--
-- Usuarios:
--   AGENTES (staff de la consultora, ven todo):
--     ana@orbita.dev     · Ana Torres
--     bruno@orbita.dev   · Bruno Díaz
--   CLIENTES:
--     laura@acme.com     · Laura Gómez   (Acme Corp)
--     marco@acme.com     · Marco Ruiz    (Acme Corp)   <- Acme tiene 2 personas
--     sofia@globex.com   · Sofía Núñez   (Globex)
-- =============================================================================

-- Limpieza (idempotente) ---------------------------------------------------
delete from auth.users where email in (
  'ana@orbita.dev', 'bruno@orbita.dev',
  'laura@acme.com', 'marco@acme.com', 'sofia@globex.com'
);
delete from public.organizations where id in (
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000002'
);

-- Organizaciones -----------------------------------------------------------
insert into public.organizations (id, name, created_at) values
  ('a0000000-0000-0000-0000-000000000001', 'Acme Corp', now() - interval '90 days'),
  ('a0000000-0000-0000-0000-000000000002', 'Globex',    now() - interval '60 days');

-- Usuarios de auth ---------------------------------------------------------
-- El trigger handle_new_user() crea el profile a partir de los metadatos.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'authenticated', 'authenticated', 'ana@orbita.dev',
   extensions.crypt('demo1234', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Ana Torres","role":"agent"}',
   now(), now()),

  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   'authenticated', 'authenticated', 'bruno@orbita.dev',
   extensions.crypt('demo1234', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Bruno Díaz","role":"agent"}',
   now(), now()),

  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   'authenticated', 'authenticated', 'laura@acme.com',
   extensions.crypt('demo1234', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Laura Gómez","role":"client","organization_id":"a0000000-0000-0000-0000-000000000001"}',
   now(), now()),

  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444',
   'authenticated', 'authenticated', 'marco@acme.com',
   extensions.crypt('demo1234', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Marco Ruiz","role":"client","organization_id":"a0000000-0000-0000-0000-000000000001"}',
   now(), now()),

  ('00000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555',
   'authenticated', 'authenticated', 'sofia@globex.com',
   extensions.crypt('demo1234', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Sofía Núñez","role":"client","organization_id":"a0000000-0000-0000-0000-000000000002"}',
   now(), now());

-- GoTrue escanea estas columnas de token como texto no-nulo al hacer login;
-- si quedan en NULL, el login falla con "Database error querying schema".
update auth.users set
  confirmation_token         = coalesce(confirmation_token, ''),
  recovery_token             = coalesce(recovery_token, ''),
  email_change_token_new     = coalesce(email_change_token_new, ''),
  email_change               = coalesce(email_change, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change               = coalesce(phone_change, ''),
  phone_change_token         = coalesce(phone_change_token, ''),
  reauthentication_token     = coalesce(reauthentication_token, '')
where email in (
  'ana@orbita.dev', 'bruno@orbita.dev',
  'laura@acme.com', 'marco@acme.com', 'sofia@globex.com'
);

-- Identidades (necesarias para el login por email/contraseña) ---------------
insert into auth.identities (
  id, provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(), u.id::text, u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now()
from auth.users u
where u.email in (
  'ana@orbita.dev', 'bruno@orbita.dev',
  'laura@acme.com', 'marco@acme.com', 'sofia@globex.com'
);

-- Tickets + hilo + timeline ------------------------------------------------
-- Desactivamos los triggers para controlar timestamps y narrativa del demo.
alter table public.tickets disable trigger tickets_log_insert;
alter table public.tickets disable trigger tickets_log_update;
alter table public.tickets disable trigger tickets_touch;
alter table public.ticket_messages disable trigger ticket_messages_touch;

insert into public.tickets (
  id, organization_id, subject, description, type, priority, status,
  created_by, assigned_to, created_at, updated_at, last_activity_at
) values
  -- Acme -------------------------------------------------------------------
  ('10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'El panel de facturación no carga',
   'Desde ayer por la tarde, al entrar en Facturación aparece una pantalla en blanco. Nos está bloqueando el cierre de mes.',
   'incident', 'high', 'in_progress',
   '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
   now() - interval '2 days', now() - interval '4 hours', now() - interval '4 hours'),

  ('10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'Solicitud: nuevo usuario para el equipo de soporte',
   '¿Podríais dar de alta a una compañera nueva con permisos de solo lectura?',
   'request', 'medium', 'in_progress',
   '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222',
   now() - interval '5 days', now() - interval '1 day', now() - interval '1 day'),

  ('10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   '¿Cómo exporto los informes a Excel?',
   'No encuentro el botón de exportar. ¿Existe esa opción?',
   'question', 'low', 'resolved',
   '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222',
   now() - interval '8 days', now() - interval '6 days', now() - interval '6 days'),

  ('10000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001',
   'Integración con nuestro CRM',
   'Nos gustaría conectar la plataforma con Salesforce. ¿Es posible?',
   'request', 'medium', 'closed',
   '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111',
   now() - interval '20 days', now() - interval '14 days', now() - interval '14 days'),

  -- Globex -----------------------------------------------------------------
  ('10000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002',
   'Caída total del servicio',
   'Ningún usuario puede acceder. Es urgente, tenemos toda la operación parada.',
   'incident', 'urgent', 'open',
   '55555555-5555-5555-5555-555555555555', null,
   now() - interval '3 hours', now() - interval '3 hours', now() - interval '3 hours'),

  ('10000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002',
   'Error intermitente al guardar cambios',
   'A veces al guardar sale un error y se pierde lo escrito. No siempre pasa.',
   'incident', 'high', 'in_progress',
   '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111',
   now() - interval '6 days', now() - interval '2 days', now() - interval '2 days');

insert into public.ticket_messages (ticket_id, author_id, body, created_at) values
  ('10000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333',
   'Buenos días, adjunto captura. La pantalla se queda completamente en blanco.',
   now() - interval '2 days'),
  ('10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'Gracias Laura, lo estamos reproduciendo. Parece un problema con el último despliegue; te confirmamos en breve.',
   now() - interval '1 day'),
  ('10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'Identificado el origen. Estamos aplicando el arreglo, os avisamos al cerrar.',
   now() - interval '4 hours'),

  ('10000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
   'Perfecto Marco. ¿Nos pasas el nombre y el email de tu compañera para crear la cuenta?',
   now() - interval '1 day'),

  ('10000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222',
   'Hola Laura. Sí: arriba a la derecha, botón "Exportar → Excel". ¡Avísame si te sirve!',
   now() - interval '6 days'),

  ('10000000-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555555',
   'No entra nadie, por favor es máxima prioridad.',
   now() - interval '3 hours'),

  ('10000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
   'Hola Sofía, ¿podrías indicarnos navegador y si ocurre en una pantalla concreta? Nos ayudaría a reproducirlo.',
   now() - interval '2 days');

-- Timeline explícito (además del alta) -------------------------------------
insert into public.ticket_events (ticket_id, actor_id, type, from_value, to_value, created_at) values
  ('10000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'created', null, 'open',            now() - interval '2 days'),
  ('10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'assigned', null, '11111111-1111-1111-1111-111111111111', now() - interval '1 day' - interval '2 hours'),
  ('10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'status_changed', 'open', 'in_progress', now() - interval '1 day'),

  ('10000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'created', null, 'open',            now() - interval '5 days'),
  ('10000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'assigned', null, '22222222-2222-2222-2222-222222222222', now() - interval '4 days'),
  ('10000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'status_changed', 'open', 'in_progress', now() - interval '1 day'),

  ('10000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'created', null, 'open',            now() - interval '8 days'),
  ('10000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'assigned', null, '22222222-2222-2222-2222-222222222222', now() - interval '7 days'),
  ('10000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'status_changed', 'open', 'resolved', now() - interval '6 days'),

  ('10000000-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555555', 'created', null, 'open',            now() - interval '3 hours'),

  ('10000000-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555555', 'created', null, 'open',            now() - interval '6 days'),
  ('10000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'assigned', null, '11111111-1111-1111-1111-111111111111', now() - interval '5 days'),
  ('10000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'status_changed', 'open', 'in_progress', now() - interval '2 days'),

  ('10000000-0000-0000-0000-000000000006', '44444444-4444-4444-4444-444444444444', 'created', null, 'open',            now() - interval '20 days'),
  ('10000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'assigned', null, '11111111-1111-1111-1111-111111111111', now() - interval '19 days'),
  ('10000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'status_changed', 'open', 'resolved', now() - interval '15 days'),
  ('10000000-0000-0000-0000-000000000006', '44444444-4444-4444-4444-444444444444', 'status_changed', 'resolved', 'closed', now() - interval '14 days');

-- Reactivamos los triggers.
alter table public.tickets enable trigger tickets_log_insert;
alter table public.tickets enable trigger tickets_log_update;
alter table public.tickets enable trigger tickets_touch;
alter table public.ticket_messages enable trigger ticket_messages_touch;

-- last_reply_by: como los triggers estaban desactivados durante el seed, lo
-- calculamos a partir del último mensaje de cada ticket (impulsa el indicador
-- derivado "de quién es la pelota").
update public.tickets t
set last_reply_by = sub.role
from (
  select distinct on (m.ticket_id) m.ticket_id, p.role
  from public.ticket_messages m
  join public.profiles p on p.id = m.author_id
  order by m.ticket_id, m.created_at desc
) sub
where sub.ticket_id = t.id;
