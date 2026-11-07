# Existing application architecture

## Baseline before Supabase preparation

- **Frontend:** React 18, TypeScript, Vite, React Router, and TanStack Query. The customer site and Admin Portal are routes in the same single-page application. UI assets are served from `client/public/assets`.
- **API:** Express 4 in `server/src`. `/api/health` reports database readiness without returning credentials or exception details. Other route groups cover authentication, products, categories, promotional media, website settings, and the admin dashboard.
- **Database:** Prisma models in `server/prisma/schema.prisma` use a local SQLite database. Product and category CRUD, settings, admin identities, and audit records are served by the Express API.
- **Admin authentication:** The API uses a two-email allowlist, password hashes, TOTP, and SQLite-backed HTTP-only sessions. Admin API routes use backend authorization middleware. Public registration is not exposed.
- **Images:** Multer validates incoming images, Sharp processes them, local files are stored under the server upload directory, and image paths are persisted in SQLite. Express serves `/uploads`.
- **Configuration:** The Vite development server proxies `/api` and `/uploads` to the local Express server. The frontend API client uses the relative `/api` prefix. Server configuration is read from ignored `server/.env`.
- **Current operational limitation:** A readiness check for `/api/health` did not verify database connectivity; process startup separately connects Prisma to SQLite.

## Supabase migration boundary

The existing Express/Prisma/SQLite and local image paths remain the default until the target Supabase project has been configured, migrated, and verified. The Supabase SQL migrations define the matching catalog, admin allowlist, audit, and storage authorization model. The optional Supabase Auth bridge validates a Supabase user and the database-backed `is_admin()` function before allowing protected Express API operations. It does not silently move catalog reads or writes away from the existing API.

The Supabase data model maps the current `Category`, `Product`, `ProductImage`, `PromotionalMedia`, `WebsiteSetting`, and `AdminAuditLog` fields. `ProductImage.file_path` and `thumb_path` are bucket object paths, not local filesystem paths. The `furniture_image` bucket is public-read for published catalog photography and admin-write only.

The optional API auth bridge is selected with `ADMIN_AUTH_PROVIDER=supabase`. It sends the caller's bearer token to Supabase for user verification, requires an `aal2` claim and an affirmative `public.is_admin()` result, and fails closed if Supabase cannot authorize the request. The browser uses only the Supabase publishable key. This bridge authorizes the existing Express routes; it does not yet move product CRUD, image upload, or catalog reads to Supabase. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for the staging boundary and manual setup.

## Existing API surface

| Route | Access | Purpose |
|---|---|---|
| `GET /api/health` | Public | API health |
| `GET /api/auth/me` | Public response; session-aware | Current local admin session |
| `POST /api/auth/login` | Public, rate-limited | Local password + TOTP login |
| `POST /api/auth/logout` | Same-origin/session | End local admin session |
| `/api/products` | Public reads; admin mutations | Product catalog, galleries, and image operations |
| `/api/categories` | Public reads; admin mutations | Product categories |
| `/api/promotional` | Public published reads; admin mutations | Promotional media |
| `/api/settings/public` | Public allow-listed values | Public website settings |
| `/api/settings` | Admin | Private settings updates |
| `/api/admin/dashboard` | Admin | Admin dashboard totals and recent products |

`server/src/routes/media.routes.ts` is currently a placeholder and is not mounted in the application.

## Deployment shape

The SPA can be hosted as static files on a frontend host with history fallback. The Express service remains necessary during migration for its existing API, image processing, and local compatibility. Supabase PostgreSQL/Auth/Storage are prepared separately; no service-role key belongs in the browser. The service role is not required by the current optional Auth bridge, which uses the publishable key and caller's verified JWT.
