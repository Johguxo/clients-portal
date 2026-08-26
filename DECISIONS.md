# Documento de decisiones — Órbita

Prueba técnica Galileo Studio · Product Engineer / Full Stack.

---

## Interpretación de producto

### ¿Cuál creo que era el problema real del cliente?

No es "queremos un gestor de tickets". El problema real es de **confianza y
visibilidad**: sus clientes viven en un grupo de WhatsApp donde nada tiene
estado, todo depende de que alguien conteste y las cosas se repiten o se pierden.
El cliente final se siente **desatendido y a ciegas**.

Lo que necesitan es un espacio que transmita **"tu solicitud está registrada,
tiene un estado y alguien responsable, y puedes verlo tú mismo sin preguntar"**.
La palabra clave de sus notas es *transparencia*. Por eso el producto gira en
torno a que **el estado de cada cosa sea siempre visible**, no solo a poder crear
tickets.

### ¿Qué he implementado primero, y por qué?

Prioricé la **columna vertebral que sostiene esa transparencia** de punta a punta:

1. **Multi-tenant con aislamiento real (RLS).** *"No queremos que unos vean lo de
   otros"* es un requisito de seguridad, no una feature. Va primero porque
   condiciona todo el modelo de datos.
2. **Tickets con estado, prioridad y tipo.** El núcleo: convierte un mensaje
   suelto en algo con seguimiento. El *tipo* (incidencia / duda / solicitud) y la
   *prioridad* recogen *"algunos temas son urgentes y otros son dudas"*.
3. **Hilo de conversación por ticket.** El sustituto directo del WhatsApp, pero
   ordenado y ligado a un asunto concreto.
4. **Timeline de actividad.** Cada cambio de estado/asignación queda registrado y
   visible: es la transparencia hecha interfaz.
5. **Dos roles (cliente / agente).** Sin el lado de la consultora, el ciclo no se
   cierra. El agente ve todo, gestiona estado/prioridad y se asigna trabajo.
6. **Dashboard por rol.** Responde a *"¿en qué punto está cada cosa?"* de un
   vistazo, distinto para el cliente y para el staff.

### ¿Qué he dejado fuera, y por qué?

- **Notificaciones (email / push).** Importantes, pero el valor central es el
  portal en sí. Se añaden encima sin rediseñar nada. → V2.
- **Detección de duplicados** (*"cosas que ya nos habían pedido"*). Requiere
  búsqueda/similitud con criterio; el histórico visible ya mitiga el problema. → V2.
- **Adjuntos.** Alto valor pero no imprescindible para demostrar el flujo. → V2.
- **Panel de administración y rol `admin`.** Hoy solo hay dos roles (`client` /
  `agent`) y los agentes son homogéneos. Crear empresas y usuarios se hace por
  seed/base de datos (un trigger genera el perfil a partir de los metadatos del
  usuario de auth). Un back-office con rol `admin` para dar de alta empresas e
  invitar usuarios es una feature entera —crear usuarios desde la UI exige la
  `service_role` con cuidado de seguridad—, así que queda fuera de V1 por criterio
  de alcance. → V2 (es el primer punto de "cómo continuaría").
- **Numeración de ticket por empresa.** Es global (`#1, #2…` compartido). Que cada
  empresa tenga su propia secuencia limpia exige un contador por tenant con
  cuidado de concurrencia; no aporta al flujo principal. → V2, decisión consciente.
- **"Esperando respuesta" como estado manual.** Se descartó a propósito: se
  convirtió en un **indicador derivado** del último mensaje (ver abajo).

### ¿Qué le preguntaría al cliente antes de una V2?

- ¿Quién da de alta a las empresas y a sus usuarios? ¿Autoservicio o lo gestiona
  la consultora?
- ¿Necesitáis **SLAs / tiempos de respuesta** y alertas cuando se incumplen?
- ¿Los clientes deben poder **cerrar** ellos mismos un ticket o solo la consultora?
- ¿Hace falta **notificar** (email) y con qué frecuencia? ¿Digest o inmediato?
- ¿Queréis **áreas/categorías** o asignación por equipos, no solo por persona?
- ¿Métricas para la consultora (volumen, tiempos, carga por agente)?

---

## Arquitectura

### ¿Por qué esta arquitectura?

**Next.js (App Router) + Supabase (PostgreSQL + Auth + RLS)**, un solo repositorio.

- El "backend" vive dentro de Next.js (**Server Actions** para escrituras,
  **Server Components** para lecturas). No monté un servicio aparte porque el
  alcance no lo justifica: sería sobre-ingeniería que se comería el tiempo.
- **Supabase** aporta Postgres, autenticación y —lo decisivo— **Row Level
  Security**: la autorización vive en la capa más profunda (la base de datos), no
  en el código de la aplicación. Para el requisito de aislamiento entre clientes,
  esto es lo más sólido y lo más fácil de defender.
- El código está **separado por capas** (`app/` = UI + acciones, `lib/` = acceso a
  datos y dominio, `supabase/` = esquema y RLS), de modo que si en el futuro hace
  falta un servicio dedicado (workers, integraciones), se extrae a `apps/api` sin
  reescribir el resto.

### ¿Cómo he modelado los datos?

Cinco entidades: **organizations** (el tenant), **profiles** (usuarios, extiende
`auth.users`, con rol `client`/`agent`), **tickets**, **ticket_messages** (el
hilo) y **ticket_events** (el timeline de auditoría).

Decisiones de modelo destacables:
- El **agente es staff global** (`organization_id` NULL) y ve todo vía RLS por rol;
  el cliente pertenece siempre a una organización. Un `CHECK` lo garantiza.
- El **timeline lo generan triggers**, no la aplicación: así el historial es
  fiable y no se puede falsear desde el cliente. Es la base de la transparencia.
- **"De quién es la pelota" es derivado, no un estado.** El estado es ciclo de
  vida puro (`open · in_progress · resolved · closed`). Un campo denormalizado
  `last_reply_by`, mantenido por trigger, permite calcular quién debe responder
  sin que nadie tenga que acordarse de cambiarlo — y el mensaje se adapta a quién
  mira (el staff ve *"Sin responder"*, el cliente *"Esperando tu respuesta"*).

### Escalabilidad

- **Aislamiento en la BD** (RLS): añadir clientes no cambia el código.
- **Índices** en las columnas de filtrado (organización, estado, asignación,
  actividad) y en las claves de los hilos/eventos.
- **Denormalización puntual** (`last_reply_by`, `last_activity_at`) para evitar
  consultas caras al listar y ordenar.
- Estructura por capas lista para **extraer servicios** sin reescritura.

### Seguridad

- **Autenticación** con Supabase Auth; sesión en cookies vía `@supabase/ssr` y
  middleware que protege todas las rutas privadas.
- **Autorización + aislamiento multi-tenant en RLS**: un cliente solo accede a
  datos de su organización; un agente, a todo. Verificado end-to-end, incluido el
  **caso negativo** (un cliente no puede crear ni leer en otra organización).
- La `anon key` es pública por diseño: **sin una sesión válida, RLS no devuelve
  nada**. Las reglas por rol (p. ej. solo el staff cambia prioridad/asignación) se
  refuerzan además en la capa de Server Actions.

---

## Estado de la entrega

### Terminado
- Autenticación, sesión y protección de rutas.
- Multi-tenant con RLS (aislamiento verificado).
- Tickets: crear, listar (filtros por estado/prioridad/tipo/empresa, búsqueda),
  detalle, hilo de conversación, timeline.
- Roles cliente/agente; gestión de estado, prioridad y asignación ("Asignarme a
  mí"); indicador derivado "de quién es la pelota".
- Dashboards por rol. Diseño basado en el branding de Galileo (ver `DESIGN.md`).
- Datos de demo (seed) y despliegue.

### A medias / mejorable
- **Selects nativos:** funcionales y accesibles, pero el menú desplegable lo pinta
  el SO; un dropdown propio quedaría más pulido y consistente.
- **Reglas por rol** repartidas entre RLS y Server Actions; consolidarlas en
  políticas más finas (p. ej. por columna) sería más robusto.
- Sin **tiempo real**: los cambios se ven al recargar/revalidar, no en vivo.

### No tocado (consciente)
- Notificaciones, adjuntos, detección de duplicados, panel de administración,
  numeración por empresa, SLAs, métricas. (Ver "dejado fuera".)

### Cómo continuaría
1. **Panel de administración** (alta de empresas/usuarios) — hoy es el mayor
   punto manual.
2. **Notificaciones por email** en cambios de estado y nuevos mensajes.
3. **Tiempo real** con Supabase Realtime en el hilo y el listado.
4. **Dropdown propio** y repaso de accesibilidad.
5. **Duplicados y SLAs**, ya con feedback real de uso.
