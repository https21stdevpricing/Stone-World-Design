# Stone World Workspace

## Overview

AB Stone World Pvt. Ltd. (est. 2003) — a premium building materials marketplace (Marble, Stone, Quartz, Tiles, SanitaryWare, Ceramic, Cement, TMT Bars, etc.) serving B2C and B2B across India. The project is a full-stack web application with a cinematic public website and an integrated admin CMS.

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite, TailwindCSS, shadcn/ui, wouter routing, framer-motion
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (API server), Vite (frontend)
- **AI**: Replit AI Integration (OpenAI) for blog AI generation

## Project Structure

```
artifacts/
  api-server/          — Express 5 backend (port 8080)
  stone-world/         — React + Vite frontend (root path "/")
  mockup-sandbox/      — Component preview server (port 8081)
lib/
  api-spec/            — OpenAPI spec (openapi.yaml)
  api-client-react/    — Orval-generated React hooks + custom fetch
  api-zod/             — Orval-generated Zod schemas
  db/                  — Drizzle ORM schema + client
```

## Public Website Pages

- `/` — Cinematic homepage with marble hero, category showcase, featured products
- `/about` — Company story, Mission, Vision, Values
- `/discover` — Product catalog with category/search filters
- `/discover/:id` — Product detail page
- `/blog` — Blog listing (Journal)
- `/blog/:id` — Full blog article
- `/contact` — Smart enquiry form (audience-type-based, returns reference number on success)
- `/track` — Enquiry tracking page (lookup by reference number SW + 6 alphanumeric chars)

## Admin CMS Pages (at /admin)

- `/admin/login` — Admin login (password: `admin@stone2024`)
- `/admin/dashboard` — Stats overview, recent enquiries
- `/admin/products` — Product CRUD, bulk operations
- `/admin/categories` — Category CRUD
- `/admin/blog` — Blog CRUD + AI generation
- `/admin/enquiries` — Enquiry inbox + CSV export + status management (New → In Discussion → Quoted → Closed)
- `/admin/media` — Media library with base64 upload (stored in Replit Object Storage)
- `/admin/settings` — Company info + password change

## Database Schema

Tables: `categories`, `products`, `blog_posts`, `enquiries` (with `reference_number` and `status` columns), `media`, `site_settings`

## Enquiry Tracking

- Each new enquiry gets a unique reference number (format: SW + 6 alphanumeric chars, e.g., `SW7TQ8N5`)
- Customers see the reference number on the contact form success screen and can track at `/track`
- Admin can update enquiry status (new/in_discussion/quoted/closed) in the enquiries admin panel
- Public track endpoint: `GET /api/enquiries/track?ref=SWXXXXXX`

## Media Storage

Uploaded images are stored in Replit Object Storage (Google Cloud Storage) for permanent persistence.

- **Upload flow**: Admin uploads image via base64 data URL → server decodes and saves to GCS → URL stored in DB as `/api/storage/objects/uploads/<uuid>`
- **Serving**: Files served via `GET /api/storage/objects/<path>` (proxied from GCS)
- **Key files**: `artifacts/api-server/src/routes/media.ts`, `artifacts/api-server/src/lib/objectStorage.ts`
- **Env vars**: `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PRIVATE_OBJECT_DIR`, `PUBLIC_OBJECT_SEARCH_PATHS`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/stone-world run dev` — run frontend locally

## Brand Identity

- Primary color: Teal (#00B4B4 / `hsl(180 100% 35%)`)
- Logo: `/sw-logo.png` (in stone-world public folder)
- Theme: White-themed, minimal, cinematic luxury feel
- Navbar: h-16 (64px), `top-16` for sticky page headers
- All page headers: sticky at `top-16` with teal icon + page title

## Frontend Components

- `Navbar.tsx` — Minimal: SW logo always visible, clean nav links, search icon, "Get a Quote" pill CTA, mobile Sheet drawer
- `GlobalSearch.tsx` — Full-screen search overlay. Opens via search icon or ⌘K. Searches products (API), categories (client filter), blog posts (client filter). Categorized results.
- `Footer.tsx` — Dark background, company info + category/company links

## Design Patterns

- Each inner page has a sticky `top-16` page header band with a teal icon and page title
- Page hero sections use `bg-gray-950` dark header with teal accent labels
- Home page: 8 sections (hero, stats, manifesto, categories, how-it-works, materials, featured products, CTA)
- ProductDetail has material story, applications, care guide, specs, inquiry CTA

## Admin Credentials

- Password: `admin@stone2024`
- Token stored in `localStorage` as `sw-admin-token`
