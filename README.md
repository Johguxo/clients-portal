# Órbita

Portal privado de cliente para consultoras tecnológicas. Sustituye el caos de
email / llamadas / WhatsApp por un espacio ordenado donde cada cliente ve el
estado de sus incidencias y solicitudes con total transparencia.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth_+_RLS-3ECF8E?style=flat&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Row_Level_Security-4169E1?style=flat&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-deploy-000000?style=flat&logo=vercel&logoColor=white)

> Prueba técnica — Product Engineer / Full Stack · Galileo Studio.

<!-- DEMO -->
**▶︎ Demo en vivo: https://orbita-bice-alpha.vercel.app** · entra con cualquiera
de las [cuentas de demo](#usuarios-de-demo) (contraseña `demo1234`).

## Funcionalidades

- **Portal multi-tenant** con aislamiento de datos entre empresas a nivel de base
  de datos (RLS): cada cliente solo ve lo suyo.
- **Tickets** con tipo (incidencia / duda / solicitud), prioridad y estado
  (abierto · en progreso · resuelto · cerrado).
- **Hilo de conversación** por ticket y **timeline de actividad** automático.
- **Indicador "de quién es la pelota"** derivado del último mensaje: el staff ve
  *"Sin responder"*, el cliente *"Esperando tu respuesta"*.
- **Dos roles:** cliente (crea, comenta, sigue) y agente/staff (ve todas las
  empresas, gestiona estado/prioridad, se asigna trabajo).
- **Listado con filtros** (estado, prioridad, tipo, empresa, "pendiente de mí") y
  búsqueda, más un **dashboard** por rol.

## Stack

- **App full-stack:** Next.js 16 (App Router) + React 19 + Tailwind CSS 4.
  El backend vive dentro de Next.js (Server Actions + Route Handlers): no hay
  servidor aparte.
- **Datos:** Supabase (PostgreSQL + Auth) con **Row Level Security** para
  aislamiento multi-tenant a nivel de base de datos.
- **Estructura:** un único repo con la app Next.js en la raíz y la definición de
  la base de datos en `supabase/` (migraciones, RLS y seed).

## Estructura

```
.
├── src/
│   ├── app/                 # Rutas Next.js (App Router)
│   │   ├── login/           #   autenticación
│   │   └── (app)/           #   portal protegido (dashboard, tickets)
│   │       └── tickets/     #   listado, detalle, nuevo + Server Actions
│   ├── components/          # UI (marca, badges, tickets, dashboard)
│   └── lib/                 # dominio, acceso a datos, helpers Supabase
├── supabase/
│   ├── migrations/          # esquema + RLS + triggers
│   └── seed.sql             # datos y usuarios de demo
├── DECISIONS.md             # documento de decisiones
└── DESIGN.md                # sistema de diseño (branding Galileo)
```

## Puesta en marcha (local)

Requisitos: Node 20+, pnpm 9+, Docker (para Supabase local).

```bash
# 1. Instalar dependencias
pnpm install

# 2. Levantar Supabase local (Postgres + Auth) — requiere Docker
pnpm db:start        # imprime URL y claves

# 3. Configurar variables de entorno
cp .env.example .env.local
#   Rellena NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
#   con los valores que imprime `pnpm db:start`.

# 4. Aplicar migraciones + datos de ejemplo
pnpm db:reset

# 5. Arrancar la app
pnpm dev             # http://localhost:3000
```

> El seed crea el esquema, las políticas RLS y los datos de demo (incluidos los
> usuarios de auth con su contraseña), así que tras `pnpm db:reset` puedes entrar
> directamente con cualquiera de las cuentas de abajo.

## Usuarios de demo

Contraseña para todos: **`demo1234`**

| Rol | Email | Organización |
| --- | --- | --- |
| Agente (staff) | `ana@orbita.dev` | — (ve todo) |
| Agente (staff) | `bruno@orbita.dev` | — (ve todo) |
| Cliente | `laura@acme.com` | Acme Corp |
| Cliente | `marco@acme.com` | Acme Corp |
| Cliente | `sofia@globex.com` | Globex |

> El aislamiento entre organizaciones se aplica con **Row Level Security** en
> Postgres: un cliente solo ve los datos de su organización; un agente los ve
> todos. No depende del código de la aplicación.

## Diseño

La interfaz se basa en el branding real de Galileo Studio (fuente Geist, acento
teal, tinta navy) adaptado a un lienzo claro para uso de portal. El detalle de
qué se extrajo de su web y cómo se mapea está en [DESIGN.md](./DESIGN.md).

## Documento de decisiones

Ver [DECISIONS.md](./DECISIONS.md).
