/**
 * upload-images-simple.cjs
 * Plain Node.js script (no TypeScript, no compilation needed).
 * Uploads all images from server/uploads/products/ to Supabase furniture_image bucket.
 * Run AFTER the FULL_DATABASE_SETUP.sql migration has been executed.
 *
 * Usage:
 *   node server/scripts/upload-images-simple.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

// ─── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://gqvnalltnxwohvrbytmp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VHahfFYchQ4EtZ19MeSjtA_frabuJIT';
const BUCKET      = 'furniture_image';
// ──────────────────────────────────────────────────────────────────────────────

const UPLOADS_DIR = path.resolve(__dirname, '../uploads/products');

const MIME_MAP = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
};

function uploadFile(localPath, storagePath, contentType) {
  return new Promise((resolve, reject) => {
    const fileBuffer = fs.readFileSync(localPath);
    const url = new URL(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`);

    const options = {
      hostname: url.hostname,
      path:     url.pathname + '?upsert=true',
      method:   'POST',
      headers: {
        'apikey':          SUPABASE_KEY,
        'Authorization':   `Bearer ${SUPABASE_KEY}`,
        'Content-Type':    contentType,
        'Content-Length':  fileBuffer.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 204) {
          resolve({ ok: true });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(fileBuffer);
    req.end();
  });
}

async function main() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.error('❌ Uploads directory not found:', UPLOADS_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(UPLOADS_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return MIME_MAP[ext] !== undefined;
  });

  console.log(`\n📦 Found ${files.length} images in uploads/products/`);
  console.log(`🚀 Uploading to Supabase bucket: ${BUCKET}\n`);

  let uploaded = 0;
  let failed   = 0;
  const errors  = [];

  for (const file of files) {
    const localPath   = path.join(UPLOADS_DIR, file);
    const storagePath = `uploads/products/${file}`;
    const ext         = path.extname(file).toLowerCase();
    const contentType = MIME_MAP[ext];

    try {
      await uploadFile(localPath, storagePath, contentType);
      console.log(`  ✅ ${storagePath}`);
      uploaded++;
    } catch (err) {
      console.error(`  ❌ ${storagePath} — ${err.message}`);
      errors.push({ file, error: err.message });
      failed++;
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✅ Uploaded: ${uploaded}  ❌ Failed: ${failed}`);

  if (errors.length > 0) {
    console.log('\nFailed files:');
    errors.forEach(({ file, error }) => console.log(`  • ${file}: ${error}`));
  }

  if (uploaded > 0 && failed === 0) {
    console.log('\n🎉 All images uploaded successfully!');
    console.log('👉 Now run LOCK_STORAGE.sql in Supabase SQL Editor to remove the anon upload policy.');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
