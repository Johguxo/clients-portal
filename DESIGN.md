# Sistema de diseño de Órbita

El encargo pide una interfaz cuidada y coherente que use el branding de
[galileostudio.ai](https://galileostudio.ai) **como guía de referencia** — sin
copiarlo literalmente. Este documento recoge qué extrajimos de su web y cómo se
traduce en el sistema de diseño de Órbita, para dejar constancia de que las
decisiones visuales están fundamentadas en su marca.

## 1. Qué extrajimos de galileostudio.ai

Valores obtenidos directamente de su CSS y HTML de producción:

| Elemento | Valor real en su web |
| --- | --- |
| **Tipografía** | `Geist` (con `Geist Fallback`) para texto; variante mono |
| **Tema** | Oscuro: fondo `#07131b`, texto `#ffffff` |
| **Acento de marca** | Teal **`#09c6b8`** (el color más usado tras blanco/negro) |
| **Acentos secundarios** | Violeta `#8d54ff` / `#a685ff`, azul `#3080ff` / `#54a2ff`, teal oscuro `#076f8d` |
| **Semánticos** | Ámbar `#fcbb00`, naranja `#ff8b1a`, rojo `#fb2c36`, verde menta `#8aceb3` |
| **Fondo claro** | `#f4f7fb` |
| **Radios** | Escala por tokens (`--radius-xs … --radius-3xl`), píldoras `9999px`, hasta `3rem` |

## 2. Decisión clave: tema claro, identidad Galileo

Su web es **oscura** (marketing, impacto visual). Órbita es un **portal de datos**
que se consulta a diario: listados, tablas, hilos largos. Para ese uso, un lienzo
**claro** ofrece mejor legibilidad y menos fatiga. La decisión de producto fue:

> Conservar la **identidad cromática** de Galileo (teal + tinta navy + acentos
> violeta/azul/ámbar) pero sobre un **lienzo claro** propio del producto.

Así el resultado se reconoce como parte del universo Galileo sin ser una copia de
la landing, que es exactamente lo que pedía el enunciado.

## 3. Mapeo de tokens (Galileo → Órbita)

Todos los tokens viven en [`src/app/globals.css`](./src/app/globals.css).

| Token de Órbita | Valor | Origen en Galileo |
| --- | --- | --- |
| `--foreground` (tinta) | `#07131b` | fondo navy de su web |
| `--background` | `#f4f7fb` | su fondo claro |
| `--primary` (acento) | `#0a7d73` | teal `#09c6b8` oscurecido para cumplir contraste AA sobre claro |
| `--accent-bright` | `#09c6b8` | teal de marca, exacto (uso decorativo: logo, gradientes) |
| `--accent-violet` | `#8d54ff` | violeta secundario, exacto |
| `--status-open` | `#2f74e0` | azul `#3080ff` |
| `--status-waiting` | `#7a3cf0` | violeta `#8d54ff` |
| `--status-progress` / `--priority-high` | `#b06a00` / `#c2650e` | ámbar/naranja `#fcbb00` / `#ff8b1a` |
| `--priority-urgent` / `--type-incident` | `#e5484d` | rojo `#fb2c36` |
| `--status-resolved` | `#0a8f6f` | verde menta `#8aceb3` |

**Tipografía:** usamos **Geist** — la misma fuente que su web —, ya integrada vía
`next/font`. No fue necesario cambiarla: coincidía con la referencia.

## 4. Principios aplicados

- **Color con significado.** El acento teal se reserva para acciones y estado
  activo; cada estado y prioridad de ticket tiene un color estable y consistente
  en toda la app (definidos una sola vez como tokens).
- **Accesibilidad.** Los colores de texto se ajustaron (p. ej. el teal a `#0a7d73`)
  para cumplir contraste AA sobre fondo claro, sin perder la identidad.
- **Contención visual.** Superficies blancas sobre lienzo `#f4f7fb`, bordes suaves
  y radios generosos (siguiendo su gusto por el redondeo) para transmitir orden.
- **La marca como mensaje.** El panel de login reproduce su estética oscura con un
  gradiente teal/violeta: el primer contacto comunica "producto con criterio".
