-- ========================================================
-- ANNAMALAI FURNITURE — QUICK SUPABASE SETUP (ONE CLICK)
-- Run this in Supabase Dashboard -> SQL Editor -> New query
-- ========================================================

-- 1. Storage Policy: Enable full CRUD on 'furniture_image' bucket
drop policy if exists "Allow all on furniture_image" on storage.objects;
create policy "Allow all on furniture_image"
on storage.objects for all
to anon, authenticated
using (bucket_id = 'furniture_image')
with check (bucket_id = 'furniture_image');

-- 2. Create Categories Table
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

-- 3. Create Products Table
create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  model_code text not null unique,
  slug text not null unique,
  category_id text not null references public.categories (id) on delete cascade,
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

-- 4. Create Product Images Table
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

-- 5. Create Website Settings Table
create table if not exists public.website_settings (
  id text primary key default gen_random_uuid()::text,
  key text not null unique,
  value text not null,
  updated_at timestamptz not null default now()
);

-- 6. Enable RLS and Add Policies for Full CRUD
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.website_settings enable row level security;

drop policy if exists "CRUD categories" on public.categories;
create policy "CRUD categories" on public.categories for all to anon, authenticated using (true) with check (true);

drop policy if exists "CRUD products" on public.products;
create policy "CRUD products" on public.products for all to anon, authenticated using (true) with check (true);

drop policy if exists "CRUD product_images" on public.product_images;
create policy "CRUD product_images" on public.product_images for all to anon, authenticated using (true) with check (true);

drop policy if exists "CRUD website_settings" on public.website_settings;
create policy "CRUD website_settings" on public.website_settings for all to anon, authenticated using (true) with check (true);

grant all on public.categories, public.products, public.product_images, public.website_settings to anon, authenticated;

-- 7. Seed Initial Categories if empty
insert into public.categories (id, name, slug, description, cover_image, display_order, is_visible)
values
  ('cat-sofas', 'Sofas', 'sofas', 'Crafted for comfort, designed for life.', '/assets/cat-sofas.jpg', 1, true),
  ('cat-beds', 'Beds', 'beds', 'Restful spaces, crafted from solid wood.', '/assets/cat-beds.jpg', 2, true),
  ('cat-dining', 'Dining Tables', 'dining-tables', 'Bring people together over timeless design.', '/assets/cat-dining.jpg', 3, true),
  ('cat-wardrobes', 'Wardrobes', 'wardrobes', 'Spacious, sturdy and elegantly crafted.', '/assets/cat-wardrobes.jpg', 4, true),
  ('cat-chairs', 'Chairs', 'chairs', 'A perfect blend of comfort and craftsmanship.', '/assets/cat-chairs.jpg', 5, true),
  ('cat-tv-units', 'TV Units', 'tv-units', 'Stylish storage for your entertainment space.', '/assets/cat-tv-units.jpg', 6, true)
on conflict (id) do nothing;
