begin;

do $$
begin
  if not exists (
    select 1 from storage.buckets where id = 'furniture_image'
  ) then
    raise exception 'Expected the existing furniture_image Storage bucket; create it before applying this migration.';
  end if;
end
$$;

update storage.buckets
set public = true,
    file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'furniture_image';

drop policy if exists furniture_image_public_read on storage.objects;
create policy furniture_image_public_read
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'furniture_image');

drop policy if exists furniture_image_admin_insert on storage.objects;
create policy furniture_image_admin_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'furniture_image'
    and (select public.is_admin())
  );

drop policy if exists furniture_image_admin_update on storage.objects;
create policy furniture_image_admin_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'furniture_image'
    and (select public.is_admin())
  )
  with check (
    bucket_id = 'furniture_image'
    and (select public.is_admin())
  );

drop policy if exists furniture_image_admin_delete on storage.objects;
create policy furniture_image_admin_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'furniture_image'
    and (select public.is_admin())
  );

-- Restrictive guards prevent any pre-existing broad policies from granting writes to this bucket.
drop policy if exists furniture_image_admin_insert_guard on storage.objects;
create policy furniture_image_admin_insert_guard
  on storage.objects as restrictive for insert to authenticated
  with check (
    bucket_id <> 'furniture_image'
    or (select public.is_admin())
  );

drop policy if exists furniture_image_admin_update_guard on storage.objects;
create policy furniture_image_admin_update_guard
  on storage.objects as restrictive for update to authenticated
  using (
    bucket_id <> 'furniture_image'
    or (select public.is_admin())
  )
  with check (
    bucket_id <> 'furniture_image'
    or (select public.is_admin())
  );

drop policy if exists furniture_image_admin_delete_guard on storage.objects;
create policy furniture_image_admin_delete_guard
  on storage.objects as restrictive for delete to authenticated
  using (
    bucket_id <> 'furniture_image'
    or (select public.is_admin())
  );

drop policy if exists furniture_image_anon_insert_guard on storage.objects;
create policy furniture_image_anon_insert_guard
  on storage.objects as restrictive for insert to anon
  with check (bucket_id <> 'furniture_image');

drop policy if exists furniture_image_anon_update_guard on storage.objects;
create policy furniture_image_anon_update_guard
  on storage.objects as restrictive for update to anon
  using (bucket_id <> 'furniture_image')
  with check (bucket_id <> 'furniture_image');

drop policy if exists furniture_image_anon_delete_guard on storage.objects;
create policy furniture_image_anon_delete_guard
  on storage.objects as restrictive for delete to anon
  using (bucket_id <> 'furniture_image');

commit;
