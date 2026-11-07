# Supabase preparation and manual setup

This repository is prepared for a staged migration, not a completed migration or deployment. The existing Express/Prisma/SQLite API and local upload handling remain in use. No product records or images are automatically copied to Supabase.

## What is prepared

- Versioned PostgreSQL/RLS migrations under `supabase/migrations`.
- Supabase Auth Email/Password login for the existing Admin Portal.
- An Express authorization bridge that verifies Supabase users and checks membership in the existing `public.admin_users` table.
- A `furniture_image` bucket policy migration for public reads and authorized-admin writes.
- Environment-based API URL and local Vite proxy configuration.
- A database-aware API health endpoint.
- Static SPA rewrite configuration for hosting the frontend separately.

Catalog reads/writes, product-image uploads/replacements/deletions, and image URL conversion still use the existing Express/SQLite/local-storage implementation. The Admin Portal uses Supabase Email/Password Auth without a TOTP prompt, but sign-in remains dependent on the target project migrations and its two pre-authorized accounts. No live Supabase authentication or database test has been performed.

The legacy local `setup-admin.ts`/TOTP utilities are not part of the current Admin login flow. Do not run `npm run setup:admin`: it can overwrite local administrator passwords and authenticator secrets. No Supabase Auth users or admin-account rows were created or changed as part of this code update.

## Local environment setup

1. Copy `server/.env.example` to the ignored `server/.env`; preserve the existing local database and authentication configuration.
2. The Vite configuration reads the project-root `.env.local` as well as `client/.env.local`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, or the existing `VITE_SUPABASE_ANON_KEY` alias, there.
3. The Express service also reads the project-root `.env.local` for those Vite-prefixed URL/key values. For production, set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in the server's environment instead. Never configure a service-role/secret key.
4. Set `ADMIN_AUTH_PROVIDER=supabase` explicitly in `server/.env` for clarity; Supabase is also the runtime default.
5. To test against local Supabase, set `VITE_DEV_API_PROXY_TARGET` to the local Express origin and set the API's `CORS_ORIGIN` to the exact browser origin.

## Supabase project setup (manual; not yet verified against a live project)

1. Back up the target Supabase database and inspect existing policies on `furniture_image`. The storage migration replaces its named policies and adds restrictive, bucket-scoped write guards (so existing broad write policies cannot grant access to this bucket); it changes the existing bucket to public-read, limits uploads to 10 MiB, and permits JPEG, PNG, and WebP. Confirm these consequences and any current bucket-specific read policies before applying it.
2. Apply the migrations in order with the Supabase CLI after linking the intended project:

   ```sh
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

3. In Supabase Auth, enable Email provider sign-in and disable public sign-ups. Create exactly two users through the trusted Auth dashboard/operator process; do not add a public registration route.
4. Preserve the existing `public.admin_users` rows. The authorization function uses its `user_id` column and does not create or populate a second admin table. Verify both rows map to existing Auth users without displaying their IDs:

   ```sql
   select
     count(*) as admin_user_rows,
     count(auth_users.id) as matching_auth_users
   from public.admin_users as admins
   left join auth.users as auth_users on auth_users.id = admins.user_id;
   ```

   Expect two rows and two matches. Do not grant table access to `anon` or expose admin assignment in the application.
5. Configure Supabase Auth Site URL and allowed redirect URLs for the intended local origins and, later, the chosen frontend host. Do not use wildcard production redirects.
6. Configure `ADMIN_AUTH_PROVIDER=supabase` on the API. The client always uses Supabase Email/Password Auth. Keep `CORS_ORIGIN` restricted to the exact frontend origin.
7. Test both authorized accounts with their Supabase Auth email/password, a wrong password, a valid non-admin Supabase user, expired token, and direct protected API access. Test a non-production project first. The Admin Portal does not request or verify TOTP.

The server uses the publishable/anon key with the caller's JWT to call Supabase Auth and the `is_admin()` RPC. A service-role key is not needed for this bridge and must never be supplied to it. The `is_admin()` authorization checks the caller's authenticated UUID against `admin_users.user_id`; it does not depend on MFA assurance level.

## Remaining migration work before cutover

- Implement and verify Supabase-backed catalog reads and admin CRUD while preserving existing API response contracts.
- Migrate/validate existing products, categories, settings, and audit records with repeatable and reversible data scripts.
- Implement Storage upload, replacement, cleanup, and URL mapping against `furniture_image`; validate both admin-only mutations and public viewing.
- Decide how the retained Express backend will be hosted or which endpoints should become Edge Functions. Do not move server-only work into the browser.
- Add live integration tests against a non-production Supabase project, including RLS authorization, Email/Password sign-in, CORS, Storage MIME/size limits, and database rollback/recovery.
- Configure production TLS, frontend/API origins, trusted proxy hops, secrets, backups, monitoring, and redirect allowlists before any deployment.

## Hosting preparation

The React/Vite SPA can be hosted as static assets. For Vercel, select `client` as the project root; `client/vercel.json` supplies SPA history fallback and Vite's production output is `dist`. The Express API must remain on a Node-compatible backend host until its existing SQLite, session, and local-file responsibilities are migrated. A static frontend host alone cannot run that backend. No live deployment was performed.
