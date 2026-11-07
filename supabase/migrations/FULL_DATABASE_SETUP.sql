-- ========================================================
-- ANNAMALAI FURNITURE — COMPLETE SUPABASE DATABASE SETUP
-- ========================================================
-- This script is completely IDEMPOTENT and safe to run in Supabase SQL Editor.
-- It creates all required tables, functions, RLS policies, storage policies,
-- links the 2 verified admin accounts, and seeds all 8 categories and 18 products.

begin;

-- 1. Enable pgcrypto
create extension if not exists pgcrypto with schema extensions;

-- 2. Ensure public.admin_users exists
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  email text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Link verified admin accounts to public.admin_users
insert into public.admin_users (user_id, email, role)
values
  ('2e70871f-b0c2-44f3-9cf5-28841e08d334', 'akilanr05@gmail.com', 'admin'),
  ('6ab39877-b1c3-4545-a5fe-0ad706f5fac5', 'aravindhjsc14@gmail.com', 'admin')
on conflict (user_id) do update set
  email = excluded.email,
  role = excluded.role,
  updated_at = now();

alter table public.admin_users enable row level security;

-- 3. Authorization Function is_admin()
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

-- 4. Create Tables
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

-- 5. Indexes
create index if not exists products_category_published_idx on public.products (category_id, is_published);
create index if not exists products_featured_published_idx on public.products (is_featured, is_published);
create index if not exists product_images_product_order_idx on public.product_images (product_id, display_order);
create index if not exists promotional_media_published_order_idx on public.promotional_media (is_published, display_order);
create index if not exists admin_audit_logs_created_at_idx on public.admin_audit_logs (created_at desc);

-- 6. Row Level Security
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.promotional_media enable row level security;
alter table public.website_settings enable row level security;
alter table public.admin_audit_logs enable row level security;

-- Policies
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select to anon, authenticated using (is_visible);

drop policy if exists categories_admin_manage on public.categories;
create policy categories_admin_manage on public.categories for all to authenticated
using ((select public.is_admin()) or ((auth.jwt() ->> 'email') in ('akilanr05@gmail.com', 'aravindhjsc14@gmail.com')))
with check ((select public.is_admin()) or ((auth.jwt() ->> 'email') in ('akilanr05@gmail.com', 'aravindhjsc14@gmail.com')));

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select to anon, authenticated using (is_published);

drop policy if exists products_admin_manage on public.products;
create policy products_admin_manage on public.products for all to authenticated
using ((select public.is_admin()) or ((auth.jwt() ->> 'email') in ('akilanr05@gmail.com', 'aravindhjsc14@gmail.com')))
with check ((select public.is_admin()) or ((auth.jwt() ->> 'email') in ('akilanr05@gmail.com', 'aravindhjsc14@gmail.com')));

drop policy if exists product_images_public_read on public.product_images;
create policy product_images_public_read on public.product_images for select to anon, authenticated using (true);

drop policy if exists product_images_admin_manage on public.product_images;
create policy product_images_admin_manage on public.product_images for all to authenticated
using ((select public.is_admin()) or ((auth.jwt() ->> 'email') in ('akilanr05@gmail.com', 'aravindhjsc14@gmail.com')))
with check ((select public.is_admin()) or ((auth.jwt() ->> 'email') in ('akilanr05@gmail.com', 'aravindhjsc14@gmail.com')));

drop policy if exists promotional_media_public_read on public.promotional_media;
create policy promotional_media_public_read on public.promotional_media for select to anon, authenticated using (is_published);

drop policy if exists promotional_media_admin_manage on public.promotional_media;
create policy promotional_media_admin_manage on public.promotional_media for all to authenticated
using ((select public.is_admin()) or ((auth.jwt() ->> 'email') in ('akilanr05@gmail.com', 'aravindhjsc14@gmail.com')))
with check ((select public.is_admin()) or ((auth.jwt() ->> 'email') in ('akilanr05@gmail.com', 'aravindhjsc14@gmail.com')));

drop policy if exists website_settings_admin_manage on public.website_settings;
create policy website_settings_admin_manage on public.website_settings for all to authenticated
using ((select public.is_admin()) or ((auth.jwt() ->> 'email') in ('akilanr05@gmail.com', 'aravindhjsc14@gmail.com')))
with check ((select public.is_admin()) or ((auth.jwt() ->> 'email') in ('akilanr05@gmail.com', 'aravindhjsc14@gmail.com')));

drop policy if exists admin_audit_logs_admin_manage on public.admin_audit_logs;
create policy admin_audit_logs_admin_manage on public.admin_audit_logs for all to authenticated
using ((select public.is_admin()) or ((auth.jwt() ->> 'email') in ('akilanr05@gmail.com', 'aravindhjsc14@gmail.com')))
with check ((select public.is_admin()) or ((auth.jwt() ->> 'email') in ('akilanr05@gmail.com', 'aravindhjsc14@gmail.com')));

grant select on public.categories, public.products, public.product_images, public.promotional_media, public.website_settings to anon, authenticated;
grant select, insert, update, delete on public.categories, public.products, public.product_images, public.promotional_media, public.website_settings, public.admin_audit_logs to authenticated;

-- Storage policies for furniture_image
update storage.buckets
set public = true,
    file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id = 'furniture_image';

drop policy if exists furniture_image_public_read on storage.objects;
create policy furniture_image_public_read on storage.objects for select to anon, authenticated
using (bucket_id = 'furniture_image');

-- Temporary seed-upload policy: allow anon INSERT for initial image upload
-- After running the upload script, run LOCK_STORAGE.sql to restrict to admins only
drop policy if exists furniture_image_seed_upload on storage.objects;
create policy furniture_image_seed_upload on storage.objects for insert to anon
with check (bucket_id = 'furniture_image');

drop policy if exists furniture_image_admin_write on storage.objects;
create policy furniture_image_admin_write on storage.objects for all to authenticated
using (
  bucket_id = 'furniture_image' and (
    (select public.is_admin()) or
    ((auth.jwt() ->> 'email') in ('akilanr05@gmail.com', 'aravindhjsc14@gmail.com'))
  )
)
with check (
  bucket_id = 'furniture_image' and (
    (select public.is_admin()) or
    ((auth.jwt() ->> 'email') in ('akilanr05@gmail.com', 'aravindhjsc14@gmail.com'))
  )
);

-- 7. Seed Categories
insert into public.categories (id, name, slug, description, cover_image, display_order, is_visible)
values ('cmw3tkxn80000146pn15i23vc', 'Sofas', 'sofas', 'Crafted for comfort, designed for life.', '/assets/cat-sofas.jpg', 1, true)
on conflict (id) do update set name = excluded.name, slug = excluded.slug, description = excluded.description, cover_image = excluded.cover_image, display_order = excluded.display_order, is_visible = excluded.is_visible;
insert into public.categories (id, name, slug, description, cover_image, display_order, is_visible)
values ('cmw3tkxno0001146pyavgjpiw', 'Beds', 'beds', 'Restful spaces, crafted from solid wood.', '/assets/cat-beds.jpg', 2, true)
on conflict (id) do update set name = excluded.name, slug = excluded.slug, description = excluded.description, cover_image = excluded.cover_image, display_order = excluded.display_order, is_visible = excluded.is_visible;
insert into public.categories (id, name, slug, description, cover_image, display_order, is_visible)
values ('cmw3tkxnz0002146paz5sao5c', 'Dining Tables', 'dining-tables', 'Bring people together over timeless design.', '/assets/cat-dining.jpg', 3, true)
on conflict (id) do update set name = excluded.name, slug = excluded.slug, description = excluded.description, cover_image = excluded.cover_image, display_order = excluded.display_order, is_visible = excluded.is_visible;
insert into public.categories (id, name, slug, description, cover_image, display_order, is_visible)
values ('cmw3tkxob0003146prglo9wky', 'Wardrobes', 'wardrobes', 'Spacious, sturdy and elegantly crafted.', '/assets/cat-wardrobes.jpg', 4, true)
on conflict (id) do update set name = excluded.name, slug = excluded.slug, description = excluded.description, cover_image = excluded.cover_image, display_order = excluded.display_order, is_visible = excluded.is_visible;
insert into public.categories (id, name, slug, description, cover_image, display_order, is_visible)
values ('cmw3tkxoo0004146pobyu9rfv', 'Chairs', 'chairs', 'A perfect blend of comfort and craftsmanship.', '/assets/cat-chairs.jpg', 5, true)
on conflict (id) do update set name = excluded.name, slug = excluded.slug, description = excluded.description, cover_image = excluded.cover_image, display_order = excluded.display_order, is_visible = excluded.is_visible;
insert into public.categories (id, name, slug, description, cover_image, display_order, is_visible)
values ('cmw3tkxp10005146ph4w55nyz', 'TV Units', 'tv-units', 'Stylish storage for your entertainment space.', '/assets/cat-tv-units.jpg', 6, true)
on conflict (id) do update set name = excluded.name, slug = excluded.slug, description = excluded.description, cover_image = excluded.cover_image, display_order = excluded.display_order, is_visible = excluded.is_visible;
insert into public.categories (id, name, slug, description, cover_image, display_order, is_visible)
values ('cmw3tkxpc0006146p9yjr5g0p', 'Dressing Tables', 'dressing-tables', 'Elegance and utility in perfect harmony.', '/assets/cat-dressing-tables.jpg', 7, true)
on conflict (id) do update set name = excluded.name, slug = excluded.slug, description = excluded.description, cover_image = excluded.cover_image, display_order = excluded.display_order, is_visible = excluded.is_visible;
insert into public.categories (id, name, slug, description, cover_image, display_order, is_visible)
values ('cmw3tkxpo0007146p5dyj024w', 'Storage Cabinets', 'storage-cabinets', 'Organized spaces with lasting strength.', '/assets/cat-storage-cabinets.jpg', 8, true)
on conflict (id) do update set name = excluded.name, slug = excluded.slug, description = excluded.description, cover_image = excluded.cover_image, display_order = excluded.display_order, is_visible = excluded.is_visible;

-- 8. Seed Products and Images
insert into public.products (id, name, model_code, slug, category_id, description, material, length, width, height, dimension_unit, specifications, is_featured, is_published)
values ('cmw3tky77000a146prv0hk2gt', 'Handcrafted Wooden Sofa', 'AF-SF001', 'handcrafted-wooden-sofa', 'cmw3tkxn80000146pn15i23vc', 'A timeless wooden sofa that blends traditional craftsmanship with modern comfort. Built from quality solid wood, it adds warmth, elegance and lasting style to your living space.', 'Solid Teak Wood & Premium Linen Fabric', 215, 88, 84, 'cm', 'Hand carved floral motifs on armrests and base; high density foam cushioning; natural walnut polish finish.', true, true)
on conflict (id) do update set name = excluded.name, model_code = excluded.model_code, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, material = excluded.material, is_featured = excluded.is_featured, is_published = excluded.is_published;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4eih2a000atqivz3bepjuy', 'cmw3tky77000a146prv0hk2gt', 'uploads/products/p-detail-sofa-main.jpg', 'uploads/products/p-detail-sofa-main.jpg', 'Handcrafted Wooden Sofa Main', 0, true)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4eih2j000ctqivfxy9spej', 'cmw3tky77000a146prv0hk2gt', 'uploads/products/p-detail-thumb-1.jpg', 'uploads/products/p-detail-thumb-1.jpg', 'Handcrafted Wooden Sofa Full View', 1, false)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4eih2s000etqivle2z4z7l', 'cmw3tky77000a146prv0hk2gt', 'uploads/products/p-detail-thumb-2.jpg', 'uploads/products/p-detail-thumb-2.jpg', 'Handcrafted Wooden Sofa Armrest Carving', 2, false)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4eih34000gtqivogongqrn', 'cmw3tky77000a146prv0hk2gt', 'uploads/products/p-detail-thumb-3.jpg', 'uploads/products/p-detail-thumb-3.jpg', 'Intricate Wood Carving Detail', 3, false)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4eih3d000itqivchx54qm6', 'cmw3tky77000a146prv0hk2gt', 'uploads/products/p-detail-thumb-4.jpg', 'uploads/products/p-detail-thumb-4.jpg', 'Premium Linen Fabric Upholstery', 4, false)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.products (id, name, model_code, slug, category_id, description, material, length, width, height, dimension_unit, specifications, is_featured, is_published)
values ('cmw3tky95000m146pbsp15gf2', 'Classic Wooden Sofa', 'AF-SF002', 'classic-wooden-sofa', 'cmw3tkxn80000146pn15i23vc', 'A timeless wooden sofa with elegant design and lasting comfort. Designed for gracious living rooms.', 'Solid Teak Wood', 200, 85, 82, 'cm', 'Solid wood frame with slatted sides and high resilience cushions.', true, true)
on conflict (id) do update set name = excluded.name, model_code = excluded.model_code, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, material = excluded.material, is_featured = excluded.is_featured, is_published = excluded.is_published;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4eih48000ktqivpl3u3hwz', 'cmw3tky95000m146pbsp15gf2', 'uploads/products/p-classic-sofa.jpg', 'uploads/products/p-classic-sofa.jpg', 'Classic Wooden Sofa', 0, true)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.products (id, name, model_code, slug, category_id, description, material, length, width, height, dimension_unit, specifications, is_featured, is_published)
values ('cmw3tky9y000q146py7k5imw4', 'Carved Wooden Sofa', 'AF-SF003', 'carved-wooden-sofa', 'cmw3tkxn80000146pn15i23vc', 'Exquisitely carved 3-seater sofa with traditional South Indian architectural flourishes and crest detailing.', 'Solid Rosewood', 210, 90, 95, 'cm', 'Ornate crown carving, deep button-tufted back cushions, heritage finish.', false, true)
on conflict (id) do update set name = excluded.name, model_code = excluded.model_code, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, material = excluded.material, is_featured = excluded.is_featured, is_published = excluded.is_published;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4eih52000mtqivugm7hzcr', 'cmw3tky9y000q146py7k5imw4', 'uploads/products/p-like-2.jpg', 'uploads/products/p-like-2.jpg', 'Carved Wooden Sofa', 0, true)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.products (id, name, model_code, slug, category_id, description, material, length, width, height, dimension_unit, specifications, is_featured, is_published)
values ('cmw3tkyan000u146p0af5w3da', 'Modern Wooden Sofa', 'AF-SF004', 'modern-wooden-sofa', 'cmw3tkxn80000146pn15i23vc', 'Clean Scandinavian lines paired with the timeless warmth of natural solid timber.', 'Solid Sheesham Wood', 195, 82, 78, 'cm', 'Low-profile silhouette, tailored cushions, smooth wax finish.', false, true)
on conflict (id) do update set name = excluded.name, model_code = excluded.model_code, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, material = excluded.material, is_featured = excluded.is_featured, is_published = excluded.is_published;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4eih5w000otqivp1ciof7b', 'cmw3tkyan000u146p0af5w3da', 'uploads/products/p-like-3.jpg', 'uploads/products/p-like-3.jpg', 'Modern Wooden Sofa', 0, true)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.products (id, name, model_code, slug, category_id, description, material, length, width, height, dimension_unit, specifications, is_featured, is_published)
values ('cmw3tkybd000y146psioartus', 'Premium Wooden Bed', 'AF-BD002', 'premium-wooden-bed', 'cmw3tkxno0001146pyavgjpiw', 'A sturdy and stylish bed crafted from quality solid wood with arched fluted headboard and matching nightstands.', 'Solid Teak Wood', 208, 192, 120, 'cm', 'King Size 78x72 mattress fit; reinforced slats; antique polish.', true, true)
on conflict (id) do update set name = excluded.name, model_code = excluded.model_code, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, material = excluded.material, is_featured = excluded.is_featured, is_published = excluded.is_published;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4eih7n000stqivdquz2mq8', 'cmw3tkybd000y146psioartus', 'uploads/products/p-premium-bed.jpg', 'uploads/products/p-premium-bed.jpg', 'Premium Wooden Bed', 0, true)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.products (id, name, model_code, slug, category_id, description, material, length, width, height, dimension_unit, specifications, is_featured, is_published)
values ('cmw3tkyc30012146pbukvjfn3', '6-Seater Dining Set', 'AF-DN003', '6-seater-dining-set', 'cmw3tkxnz0002146paz5sao5c', 'A beautifully crafted dining set for memorable moments, featuring a substantial solid wood tabletop and 6 ergonomically curved chairs.', 'Solid Sheesham Wood', 180, 95, 76, 'cm', 'Includes 1 dining table and 6 upholstered high-back chairs.', true, true)
on conflict (id) do update set name = excluded.name, model_code = excluded.model_code, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, material = excluded.material, is_featured = excluded.is_featured, is_published = excluded.is_published;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4eihb00010tqiv5ogalz7y', 'cmw3tkyc30012146pbukvjfn3', 'uploads/products/p-dining-set.jpg', 'uploads/products/p-dining-set.jpg', '6-Seater Dining Set', 0, true)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.products (id, name, model_code, slug, category_id, description, material, length, width, height, dimension_unit, specifications, is_featured, is_published)
values ('cmw3tkycs0016146pg8flsa8q', 'Wooden Wardrobe', 'AF-WR004', 'wooden-wardrobe', 'cmw3tkxob0003146prglo9wky', 'Spacious, durable and elegantly designed for modern homes. 4-door construction with bottom storage drawers.', 'Solid Teak Wood & Plywood Shelving', 190, 60, 210, 'cm', 'Brass handles, internal hanging rod, multi-tier shelving, bottom accessory drawers.', false, true)
on conflict (id) do update set name = excluded.name, model_code = excluded.model_code, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, material = excluded.material, is_featured = excluded.is_featured, is_published = excluded.is_published;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4eihbu0012tqivbjdx66pp', 'cmw3tkycs0016146pg8flsa8q', 'uploads/products/p-wardrobe.jpg', 'uploads/products/p-wardrobe.jpg', 'Wooden Wardrobe', 0, true)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.products (id, name, model_code, slug, category_id, description, material, length, width, height, dimension_unit, specifications, is_featured, is_published)
values ('cmw3tkydh001a146pc6bqopwk', 'Premium TV Unit', 'AF-TV005', 'premium-tv-unit', 'cmw3tkxp10005146ph4w55nyz', 'A stylish and functional unit for your entertainment space with media console shelves and deep drawers.', 'Solid Teak Wood', 180, 45, 52, 'cm', 'Cable management grommets, soft-close hardware, 4 spacious drawers.', false, true)
on conflict (id) do update set name = excluded.name, model_code = excluded.model_code, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, material = excluded.material, is_featured = excluded.is_featured, is_published = excluded.is_published;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4eihda0018tqivczy3dh44', 'cmw3tkydh001a146pc6bqopwk', 'uploads/products/p-tv-unit.jpg', 'uploads/products/p-tv-unit.jpg', 'Premium TV Unit', 0, true)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.products (id, name, model_code, slug, category_id, description, material, length, width, height, dimension_unit, specifications, is_featured, is_published)
values ('cmw3tkye8001e146psu8542ze', 'Dressing Table', 'AF-DT006', 'dressing-table', 'cmw3tkxpc0006146p9yjr5g0p', 'A refined dressing table with ample storage, large arched triple-view mirror and classic stool.', 'Solid Wood & Silver-Coated Glass', 120, 48, 185, 'cm', 'Includes cushioned stool, 6 side drawers, central accessory drawer.', false, true)
on conflict (id) do update set name = excluded.name, model_code = excluded.model_code, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, material = excluded.material, is_featured = excluded.is_featured, is_published = excluded.is_published;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4eihe4001atqiv11ak677b', 'cmw3tkye8001e146psu8542ze', 'uploads/products/p-dressing-table.jpg', 'uploads/products/p-dressing-table.jpg', 'Dressing Table', 0, true)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.products (id, name, model_code, slug, category_id, description, material, length, width, height, dimension_unit, specifications, is_featured, is_published)
values ('cmw3uwfkk000197bu2xrqktuh', 'Royal Carved Bed', 'AF-BD001', 'royal-carved-bed', 'cmw3tkxno0001146pyavgjpiw', 'Opulent king-size solid teak bed with intricate hand-carved floral crown, robust corner posts and reinforced slat foundation.', 'Solid Grade-A Teak Wood', 215, 198, 145, 'cm', 'King Size 78x72 inch mattress; solid wood side rails; multi-coat lacquer finish.', true, true)
on conflict (id) do update set name = excluded.name, model_code = excluded.model_code, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, material = excluded.material, is_featured = excluded.is_featured, is_published = excluded.is_published;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4eih6s000qtqivubxsj446', 'cmw3uwfkk000197bu2xrqktuh', 'uploads/products/p-royal-carved-bed.jpg', 'uploads/products/p-royal-carved-bed.jpg', 'Royal Carved Bed', 0, true)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.products (id, name, model_code, slug, category_id, description, material, length, width, height, dimension_unit, specifications, is_featured, is_published)
values ('cmw3uwflf000597bul271uuie', 'Modern Teak Bed', 'AF-BD003', 'modern-teak-bed', 'cmw3tkxno0001146pyavgjpiw', 'Contemporary low-profile solid teak bed designed with clean architectural geometry and built-in headboard ledge.', 'Solid Teak Wood', 205, 188, 98, 'cm', 'Queen Size 78x60 mattress fit; concealed heavy-duty center support legs.', false, true)
on conflict (id) do update set name = excluded.name, model_code = excluded.model_code, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, material = excluded.material, is_featured = excluded.is_featured, is_published = excluded.is_published;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4eih8i000utqiv2xmo7bp7', 'cmw3uwflf000597bul271uuie', 'uploads/products/p-modern-teak-bed.jpg', 'uploads/products/p-modern-teak-bed.jpg', 'Modern Teak Bed', 0, true)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.products (id, name, model_code, slug, category_id, description, material, length, width, height, dimension_unit, specifications, is_featured, is_published)
values ('cmw3uwfm6000997bu7rzr5o2w', 'Hydraulic Storage Bed', 'AF-BD004', 'storage-bed', 'cmw3tkxno0001146pyavgjpiw', 'Effortless pneumatic lift-up wooden storage bed offering expansive dust-free under-bed compartment for extra quilts and linens.', 'Solid Teak & Marine Grade Ply Substructure', 210, 192, 115, 'cm', 'German-engineered pneumatic pistons; partition dividers; 78x72 inch king mattress base.', false, true)
on conflict (id) do update set name = excluded.name, model_code = excluded.model_code, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, material = excluded.material, is_featured = excluded.is_featured, is_published = excluded.is_published;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4eih9d000wtqivbxt6akil', 'cmw3uwfm6000997bu7rzr5o2w', 'uploads/products/p-storage-bed.jpg', 'uploads/products/p-storage-bed.jpg', 'Storage Bed', 0, true)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.products (id, name, model_code, slug, category_id, description, material, length, width, height, dimension_unit, specifications, is_featured, is_published)
values ('cmw3uwfmw000d97bu4oqu2kxj', 'Royal Canopy Bed', 'AF-BD005', 'canopy-bed', 'cmw3tkxno0001146pyavgjpiw', 'Four-poster architectural canopy bed crafted from solid teak wood, bringing grandeur and traditional luxury into modern estates.', 'Solid Teak Wood', 218, 200, 220, 'cm', 'Turned wood posts; top cross beams for optional sheer drapery; hand-rubbed oil finish.', false, true)
on conflict (id) do update set name = excluded.name, model_code = excluded.model_code, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, material = excluded.material, is_featured = excluded.is_featured, is_published = excluded.is_published;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4eiha6000ytqivtsf9ezs6', 'cmw3uwfmw000d97bu4oqu2kxj', 'uploads/products/p-canopy-bed.jpg', 'uploads/products/p-canopy-bed.jpg', 'Canopy Bed', 0, true)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.products (id, name, model_code, slug, category_id, description, material, length, width, height, dimension_unit, specifications, is_featured, is_published)
values ('cmw4eihc40014tqivsrfifk8k', 'Handcrafted Teak Armchair', 'AF-CH007', 'handcrafted-teak-armchair', 'cmw3tkxoo0004146pobyu9rfv', 'Comfortable accent armchair with cane rattan weave backing, tapered teak legs and plush ivory cushions.', 'Solid Teak Wood & Natural Cane Weave', 75, 78, 82, 'cm', 'Hand-woven natural cane backrest, high-density foam seat, ergonomic recline angle.', true, true)
on conflict (id) do update set name = excluded.name, model_code = excluded.model_code, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, material = excluded.material, is_featured = excluded.is_featured, is_published = excluded.is_published;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4eihcf0016tqivzg1tovf7', 'cmw4eihc40014tqivsrfifk8k', 'uploads/products/p-accent-chair.jpg', 'uploads/products/p-accent-chair.jpg', 'Handcrafted Teak Armchair', 0, true)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.products (id, name, model_code, slug, category_id, description, material, length, width, height, dimension_unit, specifications, is_featured, is_published)
values ('cmw4eihef001ctqiv7ocxk2my', 'Heritage Storage Cabinet', 'AF-SC008', 'heritage-storage-cabinet', 'cmw3tkxpo0007146p5dyj024w', 'Multipurpose solid wood sideboard storage cabinet with louvered double doors, adjustable shelves and antique brass latch hardware.', 'Solid Teak Wood', 135, 46, 96, 'cm', '2 large enclosed cabinets, interior adjustable shelf, solid wood top surface.', false, true)
on conflict (id) do update set name = excluded.name, model_code = excluded.model_code, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, material = excluded.material, is_featured = excluded.is_featured, is_published = excluded.is_published;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4eihep001etqivcdpsxa34', 'cmw4eihef001ctqiv7ocxk2my', 'uploads/products/p-storage-cabinet.jpg', 'uploads/products/p-storage-cabinet.jpg', 'Heritage Storage Cabinet', 0, true)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.products (id, name, model_code, slug, category_id, description, material, length, width, height, dimension_unit, specifications, is_featured, is_published)
values ('cmw4f90ke0005wbkwas7804j5', 'Automated Royal Teak Armchair AF-TST-3634', 'AF-TST-3634', 'automated-royal-teak-armchair-af-tst-3634', 'cmw3tkxn80000146pn15i23vc', 'Handcrafted test teak wood furniture verified through automated Playwright QA testing.', 'Solid Teak Wood', null, null, null, 'cm', null, false, true)
on conflict (id) do update set name = excluded.name, model_code = excluded.model_code, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, material = excluded.material, is_featured = excluded.is_featured, is_published = excluded.is_published;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4f90nt0007wbkwavv1b2tr', 'cmw4f90ke0005wbkwas7804j5', 'uploads/products/290f27a2-fc7b-431d-91d1-f02c40f05069.jpg', 'uploads/thumbnails/290f27a2-fc7b-431d-91d1-f02c40f05069_thumb.webp', 'Automated Royal Teak Armchair AF-TST-3634', 0, true)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.products (id, name, model_code, slug, category_id, description, material, length, width, height, dimension_unit, specifications, is_featured, is_published)
values ('cmw4fawns000bwbkw2olqnuly', 'Automated Royal Teak Armchair AF-TST-1928', 'AF-TST-1928', 'automated-royal-teak-armchair-af-tst-1928', 'cmw3tkxn80000146pn15i23vc', 'Handcrafted test teak wood furniture verified through automated Playwright QA testing.', 'Solid Teak Wood', null, null, null, 'cm', null, false, true)
on conflict (id) do update set name = excluded.name, model_code = excluded.model_code, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, material = excluded.material, is_featured = excluded.is_featured, is_published = excluded.is_published;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4fawq4000dwbkw5v62dtmc', 'cmw4fawns000bwbkw2olqnuly', 'uploads/products/9eb342d3-f322-4a7d-aaf6-fca5bf6841a6.jpg', 'uploads/thumbnails/9eb342d3-f322-4a7d-aaf6-fca5bf6841a6_thumb.webp', 'Automated Royal Teak Armchair AF-TST-1928', 0, true)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;
insert into public.products (id, name, model_code, slug, category_id, description, material, length, width, height, dimension_unit, specifications, is_featured, is_published)
values ('cmw4q9ldl0035ag9sdx51lbj4', 'Heritage Teak Wood Sofa', 'AF-SF005', 'heritage-teak-wood-sofa', 'cmw3tkxn80000146pn15i23vc', 'Handcrafted solid teak wood sofa with heritage armrest carvings and premium high density foam.', 'Solid Teak Wood', 210, 85, 84, 'cm', 'Hand carved heritage motifs; natural teak polish finish.', false, true)
on conflict (id) do update set name = excluded.name, model_code = excluded.model_code, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, material = excluded.material, is_featured = excluded.is_featured, is_published = excluded.is_published;
insert into public.product_images (id, product_id, file_path, thumb_path, alt_text, display_order, is_primary)
values ('cmw4qaciq0038ag9sxsiz1qec', 'cmw4q9ldl0035ag9sdx51lbj4', 'uploads/products/3ab513f9-dfac-447f-b9ea-fe5297179729_optimized.webp', 'uploads/products/3ab513f9-dfac-447f-b9ea-fe5297179729_optimized.webp', 'Heritage Teak Wood Sofa', 0, true)
on conflict (id) do update set file_path = excluded.file_path, thumb_path = excluded.thumb_path, alt_text = excluded.alt_text, display_order = excluded.display_order, is_primary = excluded.is_primary;

-- 9. Seed Settings
insert into public.website_settings (id, key, value)
values ('cmw3tkyev001h146p1f82iubi', 'businessName', 'Annamalai Furniture')
on conflict (key) do update set value = excluded.value;
insert into public.website_settings (id, key, value)
values ('cmw3tkyf7001i146p05gj6anj', 'tagline', 'The Art of Wood — Handcrafted Luxury')
on conflict (key) do update set value = excluded.value;
insert into public.website_settings (id, key, value)
values ('cmw3tkyfi001j146p6277pon4', 'whatsappEnabled', 'false')
on conflict (key) do update set value = excluded.value;
insert into public.website_settings (id, key, value)
values ('cmw3tkyft001k146pe9u8jgav', 'whatsappNumber', '')
on conflict (key) do update set value = excluded.value;
insert into public.website_settings (id, key, value)
values ('cmw3tkyg4001l146p0beapl5p', 'aboutContent', 'Annamalai Furniture brings you handcrafted wooden furniture that blends traditional South Indian craftsmanship with modern comfort and durability.')
on conflict (key) do update set value = excluded.value;
insert into public.website_settings (id, key, value)
values ('cmw3tkygf001m146pygjljm4f', 'contactEmail', 'contact@annamalaifurniture.com')
on conflict (key) do update set value = excluded.value;

commit;
