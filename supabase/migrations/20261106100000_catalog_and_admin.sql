begin;

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if to_regclass('public.admin_users') is null
    or not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'admin_users'
        and column_name = 'user_id'
    ) then
    raise exception 'Expected the existing public.admin_users table with a user_id column.';
  end if;
end
$$;

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1
      from public.admin_users as admins
      where admins.user_id::text = (select auth.uid()::text)
    );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.categories (
  id text primary key default gen_random_uuid()::text,
  name text not null unique,
  slug text not null unique,
  description text,
  cover_image text,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  model_code text not null unique,
  slug text not null unique,
  category_id text not null references public.categories (id),
  description text,
  material text,
  length double precision,
  width double precision,
  height double precision,
  dimension_unit text default 'cm',
  specifications text,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id text primary key default gen_random_uuid()::text,
  product_id text not null references public.products (id) on delete cascade,
  file_path text not null,
  thumb_path text,
  alt_text text,
  display_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.promotional_media (
  id text primary key default gen_random_uuid()::text,
  media_type text not null default 'image',
  file_path text not null,
  poster_path text,
  title text,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.website_settings (
  id text primary key default gen_random_uuid()::text,
  key text not null unique,
  value text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid,
  action text not null,
  resource text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists products_category_published_idx
  on public.products (category_id, is_published);
create index if not exists products_featured_published_idx
  on public.products (is_featured, is_published);
create index if not exists product_images_product_order_idx
  on public.product_images (product_id, display_order);
create index if not exists promotional_media_published_order_idx
  on public.promotional_media (is_published, display_order);
create index if not exists admin_audit_logs_created_at_idx
  on public.admin_audit_logs (created_at desc);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.promotional_media enable row level security;
alter table public.website_settings enable row level security;
alter table public.admin_audit_logs enable row level security;

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read
  on public.categories for select to anon, authenticated
  using (is_visible);
drop policy if exists categories_admin_manage on public.categories;
create policy categories_admin_manage
  on public.categories for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists products_public_read on public.products;
create policy products_public_read
  on public.products for select to anon, authenticated
  using (
    is_published
    and exists (
      select 1 from public.categories
      where categories.id = products.category_id
        and categories.is_visible
    )
  );
drop policy if exists products_admin_manage on public.products;
create policy products_admin_manage
  on public.products for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists product_images_public_read on public.product_images;
create policy product_images_public_read
  on public.product_images for select to anon, authenticated
  using (
    exists (
      select 1
      from public.products
      join public.categories on categories.id = products.category_id
      where products.id = product_images.product_id
        and products.is_published
        and categories.is_visible
    )
  );
drop policy if exists product_images_admin_manage on public.product_images;
create policy product_images_admin_manage
  on public.product_images for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists promotional_media_public_read on public.promotional_media;
create policy promotional_media_public_read
  on public.promotional_media for select to anon, authenticated
  using (is_published);
drop policy if exists promotional_media_admin_manage on public.promotional_media;
create policy promotional_media_admin_manage
  on public.promotional_media for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists website_settings_admin_manage on public.website_settings;
create policy website_settings_admin_manage
  on public.website_settings for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create or replace function public.get_public_website_settings()
returns table (key text, value text)
language sql
stable
security definer
set search_path = ''
as $$
  select settings.key, settings.value
  from public.website_settings as settings
  where settings.key in ('businessName', 'whatsappEnabled', 'aboutContent', 'contactEmail');
$$;

revoke all on function public.get_public_website_settings() from public;
grant execute on function public.get_public_website_settings() to anon, authenticated;

drop policy if exists admin_audit_logs_admin_read on public.admin_audit_logs;
create policy admin_audit_logs_admin_read
  on public.admin_audit_logs for select to authenticated
  using ((select public.is_admin()));
drop policy if exists admin_audit_logs_admin_insert on public.admin_audit_logs;
create policy admin_audit_logs_admin_insert
  on public.admin_audit_logs for insert to authenticated
  with check ((select public.is_admin()) and admin_user_id = (select auth.uid()));

revoke all on public.admin_users, public.categories, public.products,
  public.product_images, public.promotional_media, public.website_settings,
  public.admin_audit_logs from anon, authenticated;
grant select on public.categories, public.products, public.product_images,
  public.promotional_media to anon, authenticated;
grant select, insert, update, delete on public.categories, public.products,
  public.product_images, public.promotional_media, public.website_settings,
  public.admin_audit_logs to authenticated;

commit;
