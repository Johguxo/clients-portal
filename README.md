# Órbita

Portal privado de cliente para consultoras tecnológicas. Sustituye el caos de
email / llamadas / WhatsApp por un espacio ordenado donde cada cliente ve el
estado de sus incidencias y solicitudes con total transparencia.

> Prueba técnica — Product Engineer / Full Stack · Galileo Studio.

## Stack

- **App full-stack:** Next.js 16 (App Router) + React 19 + Tailwind CSS 4.
  El backend vive dentro de Next.js (Server Actions + Route Handlers): no hay
  servidor aparte.
- **Datos:** Supabase (PostgreSQL + Auth) con **Row Level Security** para
  aislamiento multi-tenant a nivel de base de datos.
- **Estructura:** un único repo con la app Next.js en la raíz y la definición de
  la base de datos en `supabase/` (migraciones, RLS y seed).

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

## Documento de decisiones

Ver [DECISIONS.md](./DECISIONS.md).
