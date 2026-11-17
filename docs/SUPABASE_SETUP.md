# Supabase setup and deployment verification

The deployed Vercel project is a static Vite SPA. Its production catalog and Admin Portal use Supabase Auth, PostgREST, and Storage directly from the browser using only the publishable/anon key. The Express app in `server/` is not deployed by `vercel.json`.

## Required Vercel build environment

Configure these values in Vercel for every environment that should build the app:

- `VITE_SUPABASE_URL`: the Supabase project URL (origin only, not a `/rest/v1` endpoint).
- `VITE_SUPABASE_PUBLISHABLE_KEY`: the project's publishable/anon key.

Vite embeds these values at build time. The ignored `.env.local` and `client/.env.local` files are local-only and are not deployed. Production builds now fail explicitly if the URL or key is missing or if a secret/service-role key is provided.

`VITE_API_BASE_URL` is optional and is only needed for API fallback routes. It must be an HTTPS origin for a separately deployed API. The existing Express service uses SQLite sessions and local image files; it must not be assumed to run reliably as a Vercel serverless API without a separate persistence migration.

## Supabase schema and access controls

1. Back up the target project and verify it is the intended environment before applying database changes.
2. Apply the versioned SQL files in `supabase/migrations` in order. The migrations expect the existing `public.admin_users.user_id` mapping for `public.is_admin()`. Do not replace admin records or run legacy provisioning scripts against production.
3. Confirm the `categories`, `products`, `product_images`, `website_settings`, and `admin_users` tables exist; `public.is_admin()` returns true only for authorized authenticated users; and RLS is enabled with the checked-in policies.
4. Confirm the existing `furniture_image` bucket exists. The storage migration makes it public-read, restricts accepted uploads to JPEG/PNG/WebP and 10 MiB, and limits bucket writes to authorized admins. Review current bucket policies before applying migrations.
5. In Supabase Auth, enable Email/Password sign-in and disable public sign-ups. Ensure the intended admin Auth users are mapped to `public.admin_users.user_id`. Public email matching is not a substitute for this mapping or RLS.
6. Configure Supabase Auth's Site URL and exact allowed redirect URLs for the production domain and any preview domains that require auth callbacks. Do not use wildcard production redirects.

The browser uses only the publishable/anon key. Never place a service-role/secret key in a `VITE_` variable, the client bundle, or Git. RLS and Storage policies remain enabled; do not make admin tables writable by `anon`.

## Production checks

- Build the frontend with the same environment variables configured in Vercel.
- Test public catalog reads and image URLs while signed out.
- Test authorized admin login, `is_admin()` authorization, category/product create-read-update-delete, image upload/replace/reorder/delete, and sign-out.
- Test a non-admin account and anonymous writes; both must be denied by RLS/Storage policies.
- Verify changes in Supabase after each mutation and inspect the Vercel build/runtime logs.

The repository's `deployment-reports/FINAL_VERIFICATION_REPORT.md` records that the catalog tables and authorization function were pending at the time of that report. A later successful frontend build does not prove that the remote database was migrated. The current environment has no authenticated Vercel CLI session, and direct read-only Supabase checks are blocked by network connectivity; remote migration, login, CRUD, and upload behavior therefore remain unverified here.
