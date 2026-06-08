# InterRenta — Sitio web inmobiliario

Plataforma web de **InterRenta**, agencia de bienes raíces del **Oriente Antioqueño** (Colombia). Catálogo de propiedades en arriendo y venta, con una experiencia cinematográfica (scroll-telling), un **asistente conversacional con IA** que recomienda propiedades por presupuesto, panel administrativo y captura de leads.

- **Producción:** https://www.interrenta.com
- **Stack:** Vite + React 19 (SPA) · Supabase (DB/Auth/Storage) · Función serverless en Vercel (OpenAI) · Tailwind CSS v4
- **Despliegue:** Vercel (auto-deploy desde la rama `main`)

---

## Tabla de contenido

1. [Resumen](#1-resumen)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Arquitectura](#3-arquitectura)
4. [Estructura del proyecto](#4-estructura-del-proyecto)
5. [Variables de entorno](#5-variables-de-entorno)
6. [Conexiones externas](#6-conexiones-externas)
7. [Base de datos (Supabase)](#7-base-de-datos-supabase)
8. [Rutas](#8-rutas)
9. [Funcionalidades principales](#9-funcionalidades-principales)
10. [El Hero cinematográfico](#10-el-hero-cinematográfico)
11. [El Asistente IA](#11-el-asistente-ia)
12. [Panel administrativo](#12-panel-administrativo)
13. [Componentes y servicios](#13-componentes-y-servicios)
14. [Diseño (paleta, tipografías)](#14-diseño-paleta-tipografías)
15. [Ejecutar en local](#15-ejecutar-en-local)
16. [Build y despliegue](#16-build-y-despliegue)
17. [SEO y favicon](#17-seo-y-favicon)
18. [Notas, decisiones y pendientes](#18-notas-decisiones-y-pendientes)

---

## 1. Resumen

InterRenta es una **SPA (Single Page Application)** construida con **Vite + React**. No es Next.js: todo el render ocurre en el cliente. El contenido (propiedades) vive en **Supabase** (PostgreSQL + Auth + Storage). Una **única función serverless** en Vercel (`/api/chat`) actúa como backend para el asistente de IA, manteniendo la API key de OpenAI fuera del navegador.

> ⚠️ La raíz del proyecto en Vercel es la carpeta **`interrenta-web/`** (ahí están `package.json`, `vite.config.js`, `vercel.json` y `api/`).

---

## 2. Stack tecnológico

### Dependencias de producción
| Paquete | Versión | Uso |
|---|---|---|
| `react` / `react-dom` | ^19.2 | UI |
| `react-router-dom` | ^7.12 | Enrutamiento SPA |
| `@supabase/supabase-js` | ^2.90 | Cliente de base de datos, auth y storage |
| `framer-motion` | ^12.26 | Animaciones de UI (secciones, chat, transiciones) |
| `gsap` + `ScrollTrigger` | ^3.13 | Scroll-telling del hero cinematográfico |
| `lenis` | ^1.3 | Scroll suave (smooth scroll) en escritorio |
| `react-helmet-async` | ^3.0 | `<meta>`/SEO dinámico por página |

### Dependencias de desarrollo
- **Vite** ^7.2 (bundler/dev server) + `@vitejs/plugin-react`
- **Tailwind CSS** ^4.1 (`@tailwindcss/postcss`, `autoprefixer`, `postcss`)
- **ESLint** ^9.39 (`eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`)

### Backend serverless
- **OpenAI** (modelo `gpt-4o-mini`) vía `fetch` directo a la REST API (sin SDK), dentro de `api/chat.js`.

### Requisitos
- **Node.js 20.19+ o 22+** (requerido por Vite 7).

---

## 3. Arquitectura

```
                          ┌──────────────────────────────────────────────┐
   Navegador (SPA React)  │  Home · PropertyDetail · MunicipioPage · Admin │
                          └───────┬───────────────────────┬───────────────┘
                                  │                        │
              import.meta.env     │ (anon key)             │ fetch("/api/chat")
                                  ▼                        ▼
                       ┌────────────────────┐   ┌───────────────────────────┐
                       │   Supabase          │   │  Vercel Serverless        │
                       │  • PostgreSQL (DB)  │   │  api/chat.js              │
                       │  • Auth (admin)     │   │  • OPENAI_API_KEY (server)│
                       │  • Storage (imágenes)│  │  • OpenAI gpt-4o-mini      │
                       └─────────▲──────────┘    │  • consulta Supabase      │
                                 │               └─────────────┬─────────────┘
                                 └─────────────────────────────┘
                                       (consulta propiedades reales)
```

- **Frontend:** React renderiza todo en el cliente. Lee propiedades directamente desde Supabase con la *anon key*.
- **Asistente IA:** el navegador NO habla con OpenAI directamente (expondría la key). Llama a `/api/chat`, que corre en Vercel, donde vive `OPENAI_API_KEY`. Esa función interpreta el lenguaje natural, consulta Supabase y devuelve propiedades reales.
- **Panel admin:** usa Supabase Auth + tabla `profiles` (rol `admin`) y Storage para subir imágenes.

---

## 4. Estructura del proyecto

```
interrentaweb/                      ← raíz del repositorio (GitHub)
└── interrenta-web/                 ← raíz del proyecto (Vercel)
    ├── api/
    │   └── chat.js                 ← Función serverless (OpenAI + Supabase) del asistente
    ├── public/
    │   ├── frames/
    │   │   ├── desktop/            ← 181 frames WebP (1920×1072) ~10.8 MB
    │   │   └── mobile/             ← 181 frames WebP (1080×1928) ~11.4 MB
    │   ├── favicon.ico / favicon.png   ← logo InterRenta sobre tile oscuro
    │   ├── robots.txt · sitemap.xml
    │   └── videos/                 ← MP4 fuente de los frames (NO versionado)
    ├── src/
    │   ├── app/
    │   │   └── router.jsx          ← (router alterno; el activo es App.jsx)
    │   ├── assets/                 ← logo, imágenes, FaseScroll (frames antiguos)
    │   ├── components/
    │   │   ├── admin/PropertyModal.jsx      ← formulario crear/editar propiedad
    │   │   ├── chat/
    │   │   │   ├── AssistantChat.jsx        ← widget de chat conversacional
    │   │   │   ├── AssistantWidget.jsx      ← burbuja flotante + panel
    │   │   │   ├── AISearchBar.jsx          ← buscador "Describe lo que buscas"
    │   │   │   └── assistantBus.js          ← evento global para abrir el chat
    │   │   ├── cinematic/CinematicHero.jsx  ← hero scroll-telling (canvas + GSAP)
    │   │   ├── common/ProtectedRoute.jsx    ← guard de rutas admin
    │   │   ├── layout/Navbar.jsx
    │   │   ├── property/PropertyCard.jsx
    │   │   ├── sections/
    │   │   │   ├── StatsCounter.jsx         ← números animados
    │   │   │   ├── ZonesSection.jsx         ← explora por municipio
    │   │   │   └── HowItWorks.jsx           ← proceso en 3 pasos
    │   │   └── ui/
    │   │       ├── BrandPreloader.jsx       ← splash de marca (primera carga)
    │   │       ├── CustomCursor.jsx         ← cursor dorado (desktop)
    │   │       ├── RouteTransition.jsx      ← cortina + scroll-to-top entre rutas
    │   │       ├── WhatsAppFloat.jsx        ← botón flotante de WhatsApp
    │   │       └── AvailabilityDot.jsx
    │   ├── hooks/useAuth.js
    │   ├── lib/lenis.js            ← singleton de smooth scroll + helpers
    │   ├── pages/
    │   │   ├── Home.jsx            ← landing principal
    │   │   ├── PropertyDetail.jsx  ← detalle de propiedad (/propiedades/:code)
    │   │   ├── MunicipioPage.jsx   ← páginas por municipio (SEO local)
    │   │   ├── AdminLogin.jsx · AdminDashboard.jsx
    │   │   ├── PropertyList.jsx    ← (no enrutado actualmente)
    │   │   └── NotFound.jsx
    │   ├── services/
    │   │   ├── supabase.js         ← cliente Supabase
    │   │   ├── property.service.js ← CRUD de propiedades + código IR#####
    │   │   ├── auth.service.js     ← login/logout
    │   │   └── assistant.service.js ← sendChat() + saveLead()
    │   ├── App.jsx                 ← rutas + montaje de widgets globales + Lenis
    │   ├── main.jsx                ← entrada (BrowserRouter + HelmetProvider)
    │   └── index.css              ← Tailwind + estilos globales (cursor, Lenis)
    ├── index.html                 ← favicon, fuentes, Open Graph
    ├── vite.config.js
    ├── vercel.json                ← rewrites (SPA) + headers + exclusión /api
    └── package.json
```

---

## 5. Variables de entorno

Se definen en `interrenta-web/.env` (local) y en **Vercel → Settings → Environment Variables** (producción).

| Variable | Dónde se usa | Pública en el bundle |
|---|---|---|
| `VITE_SUPABASE_URL` | Cliente Supabase (`src/services/supabase.js`) | Sí (prefijo `VITE_`) |
| `VITE_SUPABASE_ANON_KEY` | Cliente Supabase | Sí (anon key, protegida por RLS) |
| `VITE_ADMIN_SECRET_CODE` | Paso 1 del login admin (`AdminLogin.jsx`) | Sí |
| `OPENAI_API_KEY` | **Solo** en la función serverless `api/chat.js` | **No** (sin prefijo `VITE_`, nunca llega al navegador) |

> La función serverless reutiliza `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` desde `process.env` (en Vercel todas las env vars están disponibles en runtime de funciones, sin importar el prefijo).

---

## 6. Conexiones externas

| Servicio | Para qué | Cómo conecta |
|---|---|---|
| **Supabase** | Base de datos (propiedades, perfiles, leads), Auth (admin), Storage (imágenes) | `@supabase/supabase-js` con URL + anon key |
| **OpenAI** | Interpretar lenguaje natural y redactar respuestas del asistente | `fetch` a `api.openai.com` desde `api/chat.js` (modelo `gpt-4o-mini`, structured outputs) |
| **Vercel** | Hosting, build, función serverless, DNS del dominio | Nameservers `ns1/ns2.vercel-dns.com`; auto-deploy desde `main` |
| **WhatsApp** | Contacto directo / leads | Enlaces `https://wa.me/573195227378` |
| **Instagram** | Galería de fotos extra por propiedad | Campo `instagram_url` (enlace por propiedad) |
| **Google Fonts** | Tipografías Cormorant Garamond + Inter | `<link>` en `index.html` (`display=swap`) |

---

## 7. Base de datos (Supabase)

### Tabla `properties`
Catálogo de inmuebles. Campos usados en el código:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid (PK) | |
| `code` | text | Generado automático `IR#####` (5 dígitos) |
| `title` | text | * requerido |
| `description` | text | |
| `cover_url` | text | URL pública en Storage (bucket `images`) |
| `price` | numeric | * requerido (COP) |
| `property_type` | text | `apartamento` · `casa` · `oficina` · `lote` · `local` · `finca` · `bodega` |
| `contract_type` | text | `arriendo` · `venta` |
| `status` | text | `disponible` · `reservado` · `no_disponible` |
| `sector` | text | Ej: Rionegro |
| `subsector` | text | Ej: Llanogrande |
| `bedrooms` | int | |
| `bathrooms` | int | |
| `area` | numeric | m² |
| `address` | text | |
| `instagram_url` | text | |
| `created_at` | timestamptz | Orden por defecto (desc) |

### Tabla `profiles`
Control de acceso al panel admin. `ProtectedRoute` exige `role = 'admin'`:

| Campo | Tipo |
|---|---|
| `id` | uuid (= `auth.users.id`) |
| `role` | text (`admin`) |

### Tabla `leads`
Capturados por el asistente IA. SQL de creación:

```sql
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  nombre      text,
  telefono    text,
  operacion   text,       -- arriendo | venta
  presupuesto bigint,
  zona        text,
  alcobas     int,
  tipo        text,
  mensaje     text,
  source      text default 'chatbot'
);

alter table public.leads enable row level security;

-- El sitio (anon) puede INSERTAR leads, pero no leerlos
create policy "leads_insert_anon"
  on public.leads for insert to anon
  with check (true);
```

### Storage
- **Bucket `images`** (público). Las portadas se suben a `properties/<timestamp>-<rand>.<ext>` y se guarda su `publicUrl` en `properties.cover_url` (ver `PropertyModal.jsx`).

### RLS (Row Level Security)
- `properties`: lectura pública (la web la consulta con anon key).
- `profiles`: lectura del propio perfil para validar rol admin.
- `leads`: solo `insert` para `anon`; lectura desde el dashboard de Supabase o panel autenticado.

---

## 8. Rutas

Definidas en `src/App.jsx` (con `react-router-dom`):

| Ruta | Página | Acceso |
|---|---|---|
| `/` | `Home` | Público |
| `/propiedades/:code` | `PropertyDetail` | Público |
| `/rionegro` `/envigado` `/el-retiro` `/san-vicente` | `MunicipioPage` | Público (SEO local) |
| `/panel-ir8x7k2m9z` | `AdminLogin` | Público (login) |
| `/admin-ir8x7k2m9z` | `AdminDashboard` | Protegido (`role=admin`) |
| `*` | `NotFound` | Público |

> Las rutas del panel están **ofuscadas** (sufijo `-ir8x7k2m9z`) como protección ligera; el control real lo hace `ProtectedRoute` contra la tabla `profiles`.

Widgets montados globalmente (en `App.jsx`, visibles en todas las páginas salvo admin): `BrandPreloader`, `RouteTransition`, `CustomCursor`, `WhatsAppFloat`, `AssistantWidget`.

---

## 9. Funcionalidades principales

- **Hero cinematográfico** scroll-telling (canvas + GSAP) con mensajes superpuestos. → [§10](#10-el-hero-cinematográfico)
- **Asistente IA** (burbuja flotante + buscador) que recomienda propiedades reales por presupuesto y captura leads. → [§11](#11-el-asistente-ia)
- **Catálogo en carrusel** con búsqueda local, filtros (arriendo/venta) y navegación a 3 columnas (botón · tarjetas · botón) en escritorio.
- **Explora por zona**: tarjetas de municipio que usan como fondo la portada real de una propiedad de esa zona.
- **Números animados** y **"Cómo funciona"** (3 pasos).
- **Páginas por municipio** con `Helmet` (title/description/canonical/OG) para SEO local.
- **Detalle de propiedad** tipo revista: hero full-bleed, tarjeta de contacto sticky, ficha técnica, CTA a WhatsApp.
- **Scroll suave (Lenis)** en escritorio; nativo en móvil.
- **Cursor personalizado**, **preloader de marca** y **transiciones entre rutas**.
- **Panel admin** CRUD con subida de imágenes. → [§12](#12-panel-administrativo)

---

## 10. El Hero cinematográfico

`src/components/cinematic/CinematicHero.jsx` — reproduce una secuencia de frames sobre un `<canvas>`, controlada por el scroll.

**Cómo funciona:**
- Los frames (WebP) se cargan con `new Image()` (mantiene los datos comprimidos; decodifica bajo demanda) — **no** con `createImageBitmap()`, que descomprimía todo a RGBA y saturaba la RAM en móvil.
- **GSAP ScrollTrigger** mapea el progreso de scroll al índice del frame y dibuja con `ctx.drawImage()` (escalado "cover").
- La altura del contenedor se fija **una sola vez** en `useLayoutEffect` (vía DOM directo) para que la barra de dirección del navegador móvil no provoque recálculos.
- El contenedor visible usa `position: sticky` + `height: 100svh`.

**Overlays / mensajes:** 5 textos con ventanas de progreso **continuas y solapadas** → siempre hay un mensaje visible (cross-fade). En escritorio animan opacidad + `letter-spacing` + escala; en móvil solo opacidad + `translate` (sin reflow).

**Optimización móvil:**
- Se usa **1 de cada 3 frames** (`MOBILE_STEP = 3` → ~61 de 181) para reducir descarga y decodificación.
- `decoding="async"` en la carga.
- Sombras de texto livianas (las de 50–100px de blur se repintaban por frame).
- Recorrido más corto que escritorio.

**Frames:** se generan con FFmpeg desde los MP4 en `public/videos/` (no versionados). Desktop a 1920px, mobile a 1080px, formato WebP.

---

## 11. El Asistente IA

Recomendador conversacional que entiende lenguaje natural y devuelve **propiedades reales** (nunca inventadas).

### Flujo
```
Usuario escribe / usa chips / barra "Describe lo que buscas"
        │
        ▼
  POST /api/chat  { messages, filtros }
        │
        ▼  (OpenAI gpt-4o-mini, structured outputs)
  Extrae filtros { operacion, presupuesto, zona, alcobas, tipo }
  + redacta "reply" + decide listo_para_buscar
        │
        ▼  si listo → consulta Supabase (status=disponible, contract_type, ...)
  Selección por cercanía al presupuesto (relajación progresiva de filtros)
        │
        ▼
  { reply, filtros, propiedades }  → tarjetas dentro del chat
        │
        ▼
  Formulario de lead → saveLead() (tabla leads) + CTA WhatsApp
```

### Piezas
- **`api/chat.js`** (serverless): system prompt acotado a InterRenta/bienes raíces; structured outputs (JSON schema estricto); consulta Supabase; **nunca** inventa precios/propiedades. Límites de tamaño de mensaje e historial para controlar costo.
- **`AssistantChat.jsx`**: UI del chat (burbujas, typing, chips contextuales, tarjetas de propiedad, formulario de lead, *fallback* a WhatsApp si la API falla).
- **`AssistantWidget.jsx`**: burbuja flotante dorada (abajo-izquierda) que abre un panel con el chat. Escucha el evento global `assistantBus`.
- **`AISearchBar.jsx`**: barra "Describe lo que buscas" (después del hero) que abre el asistente e inyecta la consulta.
- **`assistant.service.js`**: `sendChat()` (→ `/api/chat`) y `saveLead()` (→ Supabase).

### Requisitos para que funcione
1. `OPENAI_API_KEY` configurada en Vercel.
2. Tabla `leads` creada (SQL en [§7](#7-base-de-datos-supabase)).
3. Solo opera en el sitio **desplegado** (la función `/api` no corre con `npm run dev`; usar la URL de Vercel o `vercel dev`).

### Notificación de leads (opcional)
Se puede automatizar con **n8n** vía **Supabase Database Webhook** → Webhook de n8n → Email / Google Sheets / Telegram. No requiere cambios de código.

---

## 12. Panel administrativo

- **Login en 2 pasos** (`AdminLogin.jsx`): código secreto (`VITE_ADMIN_SECRET_CODE`) → email/contraseña (Supabase Auth).
- **`ProtectedRoute.jsx`**: valida sesión y `profiles.role === 'admin'`; si no, redirige a `/panel-ir8x7k2m9z`.
- **`AdminDashboard.jsx`**: lista propiedades, crea/edita (modal), elimina, y cambia el `status` en línea.
- **`PropertyModal.jsx`**: formulario completo; sube la portada a Supabase Storage (bucket `images`) y guarda `cover_url`. El `code` `IR#####` se genera solo al crear.

---

## 13. Componentes y servicios

### Servicios (`src/services/`)
| Archivo | Exporta | Hace |
|---|---|---|
| `supabase.js` | `supabase` | Cliente con URL + anon key |
| `property.service.js` | `getAllProperties`, `getPropertiesBySector`, `getPropertyByCode`, `getPropertyById`, `createProperty`, `updateProperty`, `deleteProperty` | CRUD + generación de `code` |
| `auth.service.js` | `login`, `logout`, `getUser` | Auth Supabase |
| `assistant.service.js` | `sendChat`, `saveLead` | Chat IA + leads |

### UI / experiencia (`src/components/ui/`, `lib/`)
| Componente | Función |
|---|---|
| `BrandPreloader` | Splash de marca en la primera carga de la sesión (`sessionStorage`) |
| `CustomCursor` | Cursor dorado con anillo de rezago (solo puntero fino / desktop; oculto en admin) |
| `RouteTransition` | Cortina con logo + scroll-to-top al cambiar de ruta |
| `WhatsAppFloat` | Botón flotante de WhatsApp (abajo-derecha) |
| `lib/lenis.js` | Singleton de Lenis + helpers `scrollToTop` / `scrollToEl` |

---

## 14. Diseño (paleta, tipografías)

**Colores de marca:**
| Uso | Hex |
|---|---|
| Fondos | `#161616` · `#1a1a1a` · `#1f1f1f` · `#262525` · `#0d0d0d` |
| Dorado (principal) | `#ecb337` · `#f5d170` · `#d7af4d` |
| Acento teal | `#0d4447` |
| Texto títulos | `#e2e2e2` |
| Texto cuerpo | `#b8bcc8` |
| Texto apagado | `#9aa0ad` · `#6b7280` |

**Tipografías** (Google Fonts, cargadas en `index.html`):
- **Cormorant Garamond** (serif) — títulos.
- **Inter** (sans-serif) — cuerpo/UI.

---

## 15. Ejecutar en local

```bash
cd interrenta-web
npm install

# crea interrenta-web/.env con:
#   VITE_SUPABASE_URL=...
#   VITE_SUPABASE_ANON_KEY=...
#   VITE_ADMIN_SECRET_CODE=...

npm run dev      # servidor de desarrollo (Vite)
npm run build    # build de producción → dist/
npm run preview  # sirve el build localmente
npm run lint     # ESLint
```

> El **asistente IA no funciona con `npm run dev`** porque la función `/api/chat` no corre en el dev server de Vite. Para probarlo en local usa `vercel dev` (requiere `OPENAI_API_KEY` en el entorno) o pruébalo en el sitio desplegado.

---

## 16. Build y despliegue

- **Hosting:** Vercel. **Root Directory** del proyecto = `interrenta-web/`.
- **Auto-deploy:** cada push a `main` dispara un build (`vite build`) y un deploy.
- **Función serverless:** `interrenta-web/api/chat.js` → endpoint `https://<dominio>/api/chat` (runtime Node.js).
- **`vercel.json`:**
  - `rewrites`: todo lo que no sea archivo estático / `api/` / `sitemap.xml` / `robots.txt` / `assets/` / `favicon.ico` se reescribe a `/index.html` (necesario para el enrutado SPA).
  - `headers`: `Content-Type` correcto para `sitemap.xml` y `robots.txt`.
- **Dominio:** `interrenta.com`, DNS gestionado en Vercel (nameservers `ns1/ns2.vercel-dns.com`).

---

## 17. SEO y favicon

- **`react-helmet-async`**: las `MunicipioPage` definen `title`, `description`, `canonical` y Open Graph por municipio.
- **`index.html`**: meta description, Open Graph y favicon.
- **`public/sitemap.xml`** y **`public/robots.txt`** (robots bloquea las rutas admin ofuscadas).
- **Favicon:** `favicon.ico` (PNG embebido) + `favicon.png` (192px) generados desde el logo recortado sobre un **tile oscuro** `#1a1a1a` (para que sea visible en fondos claros y oscuros). Versionado con `?v=3` para forzar refresco de caché.

> Nota: Google cachea los favicons de resultados de búsqueda en su propio horario (días–semanas). Para acelerar: Search Console → Inspección de URL → "Solicitar indexación".

---

## 18. Notas, decisiones y pendientes

### Decisiones técnicas
- **`new Image()` vs `createImageBitmap()`** en el hero: se usa `new Image()` para no saturar la RAM móvil (el bitmap decodificaba ~1.5 GB de frames).
- **Altura del hero fija en `useLayoutEffect`**: evita que la barra de dirección móvil cause re-render → ScrollTrigger → "scroll loco".
- **Lenis solo en escritorio**: en móvil el scroll nativo ya es fluido y evita interferir con el hero.
- **DB como fuente de verdad en el chat**: el LLM solo interpreta y redacta; las propiedades salen siempre de Supabase.

### Limitaciones conocidas
- **ESLint** reporta falsos positivos de `'motion' is defined but never used` (la config no detecta el uso de `motion` en JSX). No bloquea el build. Es un patrón presente en todo el repo.
- El asistente requiere despliegue (la función `/api` no existe en `vite dev`).

### Posibles mejoras
- **Re-extraer frames móviles a menor resolución** (~720px) para más rendimiento (hoy son 1080px y se dibujan a ~390px).
- Optimizar imágenes pesadas en `src/assets/` (algunas >2 MB).
- Integrar la vista de **leads** dentro del panel admin.
- Automatizar notificación de leads con **n8n** (Supabase Webhook → Email/Sheets/Telegram).
- Considerar **rate limiting** real (p. ej. Upstash) para `/api/chat` en producción.

---

<div align="center">

**InterRenta** · Bienes Raíces · Oriente Antioqueño
🤖 Documentación generada con [Claude Code](https://claude.com/claude-code)

</div>
