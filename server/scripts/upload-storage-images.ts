import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !key) {
  console.error('Supabase URL or key missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, key);

async function uploadImages() {
  const dir = path.resolve(__dirname, '../uploads/products');
  if (!fs.existsSync(dir)) {
    console.error('Uploads dir not found:', dir);
    return;
  }

  const files = fs.readdirSync(dir);
  console.log(`Found ${files.length} images to upload to furniture_image bucket...\n`);

  let uploaded = 0;
  let failed = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (!fs.statSync(fullPath).isFile()) continue;

    const fileBuffer = fs.readFileSync(fullPath);
    const ext = path.extname(file).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    };
    const contentType = mimeMap[ext] || 'application/octet-stream';
    const storagePath = `uploads/products/${file}`;

    const { data, error } = await supabase.storage
      .from('furniture_image')
      .upload(storagePath, fileBuffer, { contentType, upsert: true });

    if (error) {
      console.error(`❌ Failed ${file}:`, error.message);
      failed++;
    } else {
      console.log(`✅ Uploaded: ${storagePath}`);
      uploaded++;
    }
  }

  console.log(`\nUpload complete: ${uploaded} uploaded, ${failed} failed.`);
}

uploadImages().catch(console.error);
