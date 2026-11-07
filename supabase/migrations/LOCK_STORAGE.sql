-- ========================================================
-- LOCK STORAGE: Run this AFTER the initial image upload is done.
-- Removes the temporary anon seed-upload policy.
-- Only authenticated admins can write to storage after this.
-- ========================================================

drop policy if exists furniture_image_seed_upload on storage.objects;
