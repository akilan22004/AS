import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const secretKey = process.env.SUPABASE_SECRET_KEY || '';

console.log('=== Annamalai Furniture - Supabase Sync & Verification ===\n');
console.log('Project URL:', supabaseUrl);
console.log('Publishable Key:', publishableKey ? `${publishableKey.substring(0, 15)}...` : 'MISSING');
console.log('Secret Key configured:', secretKey ? 'YES (Privileged)' : 'NO (Publishable mode)');

async function checkSync() {
  if (!supabaseUrl || !publishableKey) {
    console.error('❌ Supabase credentials missing.');
    return;
  }

  const supabase = createClient(supabaseUrl, secretKey || publishableKey);

  // 1. Check Tables
  const tables = ['categories', 'products', 'product_images', 'admin_users', 'promotional_media', 'website_settings'];
  console.log('\n--- Checking Supabase Database Tables ---');
  let missingTables = 0;

  for (const t of tables) {
    const { count, error, data } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) {
      if (error.code === '42501') {
        console.log(`🔒 Table '${t}': Protected by RLS (Exists and secured)`);
      } else if (error.code === 'PGRST205') {
        console.log(`⚠️  Table '${t}': Not found in schema (Pending migration)`);
        missingTables++;
      } else {
        console.log(`❓ Table '${t}': ${error.code} - ${error.message}`);
      }
    } else {
      console.log(`✅ Table '${t}': Exists (Records: ${count ?? 0})`);
    }
  }

  // 2. Check Storage
  console.log('\n--- Checking Supabase Storage ---');
  const { data: bucketFiles, error: bucketError } = await supabase.storage.from('furniture_image').list();
  if (bucketError) {
    console.log(`❌ Bucket 'furniture_image': ${bucketError.message}`);
  } else {
    console.log(`✅ Bucket 'furniture_image': Exists (${bucketFiles?.length || 0} files found)`);
  }

  // 3. Status Summary
  console.log('\n--- Summary ---');
  if (missingTables > 0) {
    console.log(`⚠️  ${missingTables} table(s) pending creation.`);
    console.log('👉 Complete SQL migration script is ready at:');
    console.log('   supabase/migrations/FULL_DATABASE_SETUP.sql');
    console.log('   Run this file in the Supabase Dashboard SQL Editor (or provide DATABASE_URL/SUPABASE_SECRET_KEY locally).');
  } else {
    console.log('🎉 All tables verified and ready in Supabase!');
  }
}

checkSync().catch(err => console.error('Unexpected error:', err));
