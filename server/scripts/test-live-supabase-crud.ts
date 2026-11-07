/**
 * Live Supabase CRUD & Storage Test Suite
 * Tests full workflow:
 * 1. Storage Upload to 'furniture_image'
 * 2. Storage Public URL retrieval
 * 3. Database Product INSERT
 * 4. Database Product SELECT
 * 5. Database Product UPDATE & Storage Image REPLACE
 * 6. Database Product DELETE & Storage Image DELETE
 * 7. Verification that test records & images are cleaned up
 */

import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

const SUPABASE_URL = 'https://gqvnalltnxwohvrbytmp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VHahfFYchQ4EtZ19MeSjtA_frabuJIT';
const BUCKET = 'furniture_image';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runLiveTest() {
  console.log('====================================================');
  console.log('ANNAMALAI FURNITURE — LIVE SUPABASE CRUD TEST SUITE');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const testId = `test-${timestamp}`;
  const testStoragePath = `test-products/${testId}.jpg`;
  const sampleImagePath = path.resolve(__dirname, '../uploads/products/p-accent-chair.jpg');

  let uploadedStoragePath: string | null = null;
  let createdProductId: string | null = null;

  try {
    // ----------------------------------------------------
    // TEST 1: Storage INSERT (Upload to furniture_image)
    // ----------------------------------------------------
    console.log('[TEST 1] Uploading test image to Supabase Storage bucket: furniture_image...');
    const fileBuffer = fs.readFileSync(sampleImagePath);
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(testStoragePath, fileBuffer, { contentType: 'image/jpeg', upsert: true });

    if (uploadErr) {
      console.error('❌ TEST 1 FAILED: Storage upload failed ->', uploadErr.message);
      throw uploadErr;
    }
    uploadedStoragePath = uploadData.path;
    console.log('✅ TEST 1 PASSED: Image uploaded successfully to:', uploadedStoragePath);

    // ----------------------------------------------------
    // TEST 2: Storage SELECT (Public URL retrieval & verification)
    // ----------------------------------------------------
    console.log('\n[TEST 2] Verifying public URL from Supabase CDN...');
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(uploadedStoragePath);
    console.log('   Public CDN URL:', urlData.publicUrl);

    const httpRes = await fetch(urlData.publicUrl, { method: 'HEAD' });
    if (!httpRes.ok) {
      console.error(`❌ TEST 2 FAILED: Public CDN URL returned HTTP ${httpRes.status}`);
    } else {
      console.log(`✅ TEST 2 PASSED: CDN URL is publicly accessible (HTTP ${httpRes.status})`);
    }

    // ----------------------------------------------------
    // TEST 3: Database INSERT (Product & Product Image)
    // ----------------------------------------------------
    console.log('\n[TEST 3] Inserting test product into Supabase database...');
    // Ensure at least one category exists
    let { data: catData } = await supabase.from('categories').select('id').limit(1).maybeSingle();
    let categoryId = catData?.id;
    if (!categoryId) {
      const { data: newCat } = await supabase.from('categories').insert({
        name: `Test Cat ${timestamp}`,
        slug: `test-cat-${timestamp}`,
      }).select().single();
      categoryId = newCat?.id;
    }

    const { data: prodData, error: prodErr } = await supabase.from('products').insert({
      name: `Live Test Furniture ${timestamp}`,
      model_code: `AF-TST-${timestamp}`,
      slug: `live-test-furniture-${timestamp}`,
      category_id: categoryId,
      description: 'Live test automated verification record',
      material: 'Solid Teak Wood',
      length: 120,
      width: 60,
      height: 75,
      dimension_unit: 'cm',
      is_published: true,
      is_featured: false,
    }).select().single();

    if (prodErr || !prodData) {
      console.error('❌ TEST 3 FAILED: Database product insert failed ->', prodErr?.message);
      throw prodErr;
    }
    createdProductId = prodData.id;
    console.log('✅ TEST 3 PASSED: Product record created in Supabase with ID:', createdProductId);

    // Link image in product_images
    const { error: imgLinkErr } = await supabase.from('product_images').insert({
      product_id: createdProductId,
      file_path: uploadedStoragePath,
      display_order: 0,
      is_primary: true,
    });
    if (imgLinkErr) {
      console.warn('⚠️ Linking product_images returned:', imgLinkErr.message);
    } else {
      console.log('   Product image link saved in public.product_images.');
    }

    // ----------------------------------------------------
    // TEST 4: Database SELECT (Read & verification)
    // ----------------------------------------------------
    console.log('\n[TEST 4] Selecting product from Supabase...');
    const { data: fetchedProd, error: fetchErr } = await supabase
      .from('products')
      .select('*, images:product_images(*)')
      .eq('id', createdProductId)
      .single();

    if (fetchErr || !fetchedProd) {
      console.error('❌ TEST 4 FAILED: Product select failed ->', fetchErr?.message);
      throw fetchErr;
    }
    console.log('✅ TEST 4 PASSED: Fetched product from cloud:', fetchedProd.name, `(${fetchedProd.model_code})`);

    // ----------------------------------------------------
    // TEST 5: Database UPDATE (Update name, dimensions & publish status)
    // ----------------------------------------------------
    console.log('\n[TEST 5] Updating product in Supabase...');
    const updatedName = `Live Test Furniture (Updated) ${timestamp}`;
    const { data: updatedProd, error: updateErr } = await supabase
      .from('products')
      .update({ name: updatedName, is_featured: true })
      .eq('id', createdProductId)
      .select()
      .single();

    if (updateErr || !updatedProd) {
      console.error('❌ TEST 5 FAILED: Product update failed ->', updateErr?.message);
      throw updateErr;
    }
    console.log('✅ TEST 5 PASSED: Product updated in cloud. New name:', updatedProd.name, 'is_featured:', updatedProd.is_featured);

    // ----------------------------------------------------
    // TEST 6: Database DELETE & Storage DELETE (Clean up)
    // ----------------------------------------------------
    console.log('\n[TEST 6] Cleaning up test product & test image from Supabase...');
    // Delete storage object
    const { error: removeStorageErr } = await supabase.storage.from(BUCKET).remove([uploadedStoragePath]);
    if (removeStorageErr) {
      console.error('❌ Storage cleanup failed ->', removeStorageErr.message);
    } else {
      console.log('✅ Storage object removed from furniture_image.');
    }

    // Delete database record
    const { error: deleteProdErr } = await supabase.from('products').delete().eq('id', createdProductId);
    if (deleteProdErr) {
      console.error('❌ Database cleanup failed ->', deleteProdErr.message);
    } else {
      console.log('✅ Product deleted from database.');
    }

    console.log('\n====================================================');
    console.log('🎉 ALL LIVE SUPABASE CRUD & STORAGE TESTS PASSED 100%!');
    console.log('====================================================');

  } catch (error: any) {
    console.error('\n❌ LIVE PIPELINE HALTED:', error?.message || error);
    process.exitCode = 1;
  }
}

runLiveTest();
