# ANNAMALAI FURNITURE — Phase 2 Supabase Database and Auth Audit

Date: 2026-11-06

## Status

**Phase 2: BLOCKED pending owner-side SQL Editor verification and confirmation.**

No Supabase migration, Auth account, admin record, policy, product, or storage object was modified. The workspace has the public publishable/anon key but no database connection, Supabase CLI access token, service-role key, or direct SQL connection. Those privileged credentials must not be sent in chat or placed in frontend configuration.

## Checks completed

- The configured project URL and publishable/anon key point to the same Supabase project.
- Supabase Auth settings endpoint responds and reports Email provider enabled.
- The live public API recognizes `public.admin_users`; selecting from it with the publishable key returns `42501 permission denied`, as expected for a protected admin table. A non-row-returning column probe confirms `user_id` exists.
- `public.admin_accounts` is not present in the public API schema cache.
- `public.is_admin()` is not present in the public API schema cache (`PGRST202`).
- Earlier catalog probes returned `PGRST205` for the expected catalog tables. This means PostgREST cannot resolve them from its schema cache; a privileged schema inspection is needed to distinguish absent tables from schema-cache/configuration issues.
- Storage object-list request for `furniture_image` returned HTTP 200 with an empty result. Bucket metadata and object access were not verified; no upload or write was attempted.
- No IDs, emails, tokens, or secret values were returned in the diagnostics.

## Confirmed login blocker

The frontend calls Supabase `signInWithPassword()` and then requires `supabase.rpc('is_admin')`. The Express admin middleware independently validates the caller token and calls the same RPC. Without `public.is_admin()`, authorized login cannot complete and protected API requests cannot authorize an administrator.

The existing migration source has been aligned to `public.admin_users.user_id` and does not create a duplicate admin table. **That source change has not been applied to the live project.** The two Auth-user mappings also cannot be confirmed using the public key.

## Required read-only SQL Editor checks

Run these in the Supabase Dashboard SQL Editor for the intended project. They return schema/policy metadata and aggregate counts only; they do not return user IDs or edit data.

### Confirm relevant tables and columns

```sql
select table_name, column_name, data_type, udt_name
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'admin_users',
    'categories',
    'products',
    'product_images',
    'promotional_media',
    'website_settings',
    'admin_audit_logs'
  )
order by table_name, ordinal_position;
```

### Verify the existing two admin rows map to Auth users

```sql
select
  count(*) as admin_user_rows,
  count(*) filter (
    where exists (
      select 1
      from auth.users as auth_user
      where auth_user.id::text = admins.user_id::text
    )
  ) as matching_auth_users,
  count(distinct admins.user_id) as distinct_admin_ids
from public.admin_users as admins;
```

Expected for two valid, distinct existing admins: all three counts equal `2`. Do not paste IDs, emails, passwords, or tokens in chat.

### Inspect existing policies

```sql
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where (schemaname = 'public'
       and tablename in ('admin_users', 'categories', 'products', 'product_images',
                         'promotional_media', 'website_settings', 'admin_audit_logs'))
   or (schemaname = 'storage' and tablename = 'objects')
order by schemaname, tablename, policyname;
```

### Inspect the existing bucket without listing object names

```sql
select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'furniture_image';
```

## Candidate authorization function SQL

Do **not** execute until the schema check confirms that `public.admin_users.user_id` contains the Supabase Auth UUIDs and the owner approves applying this function. It changes no admin rows and grants execution only to authenticated users.

```sql
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users as admins
    where admins.user_id::text = (select auth.uid()::text)
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
```

The application migration `supabase/migrations/20261106103000_password_only_admin_authorization.sql` contains this logic. It must not be applied blindly until the existing table's schema and RLS/policy context are confirmed. The broader catalog migration also touches catalog grants/policies, so it requires inspection against the live schema before execution.

## Files and tests

- Phase 1 backup and inventory: **PASS**; see `PHASE_1_REPORT.md`.
- Supabase Auth settings request: **PASS** (Email provider enabled).
- Admin table/RPC compatibility probes: **FAIL** for current app readiness (`is_admin()` missing; `admin_accounts` missing).
- Admin row to Auth user match: **NOT TESTED** (privileged access required).
- Storage object listing: **PASS with empty result**; bucket metadata, image read, and upload authorization: **NOT TESTED**.
- Live login: **NOT TESTED**; no account password was used.
- No write/delete operations performed.

## Required owner action and stop point

1. Run the read-only SQL checks above in Supabase SQL Editor.
2. Confirm that `admin_user_rows`, `matching_auth_users`, and `distinct_admin_ids` are all `2`; keep identifiers private.
3. Review the existing policies and bucket configuration.
4. Confirm whether to apply only the `is_admin()` function, or provide the verified live catalog schema so the broader migrations can be safely assessed.

**Do not proceed to Phase 3 data migration or Phase 4 integration changes until these checks and the required migration approval are complete. Do not begin Phase 5 hosting or deployment without separate explicit approval.**
