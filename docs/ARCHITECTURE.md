# Application and deployment architecture

## Frontend and Supabase

- **Frontend:** React 18, TypeScript, Vite, React Router, and TanStack Query. The customer site and Admin Portal are routes in the same SPA; UI assets are served from `client/public/assets`.
- **Authentication:** The browser uses Supabase Email/Password Auth. Admin access requires `public.is_admin()` to return `true`; a failed or missing authorization RPC does not grant access.
- **Catalog operations:** `client/src/services/api.ts` uses Supabase PostgREST directly for catalog reads, category/product CRUD, dashboard queries, and product-image metadata. Product files are uploaded to the `furniture_image` bucket. Public catalog reads and admin writes are controlled by the Supabase RLS and Storage policies.
- **Configuration:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are embedded during the Vite build. Production builds fail when either is missing. The browser must never receive a Supabase service-role/secret key.

## Express service

`server/src` contains the separate Express API, Prisma/SQLite data access, SQLite-backed sessions, Sharp image processing, and local `/uploads` file serving. Vite proxies `/api` and `/uploads` to this service during local development. The client can use `VITE_API_BASE_URL` for API fallback routes when an independently hosted API is available.

## Vercel deployment boundary

The root `vercel.json` deploys only the static SPA and its history fallback; it does not build or run `server/`. The current Express service's SQLite session store and local upload directory are not durable serverless storage. Production catalog and image operations therefore use Supabase directly. If an API fallback is needed, it must target a separately deployed API with durable database/session/file storage, correct HTTPS/CORS settings, and the caller's Supabase bearer token.

The SQL migrations under `supabase/migrations` establish the catalog schema, authorization function, RLS, and Storage policies. A successful frontend build does not apply or verify those migrations. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for the required production checks and known verification limits.

`server/src/routes/media.routes.ts` is currently a placeholder and is not mounted.
