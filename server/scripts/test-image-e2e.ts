/// <reference lib="dom" />
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';

async function runTest() {
  console.log('=== Annamalai Furniture - Realtime Image & Product E2E Verification ===\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  // Test Image
  const sampleImagePath = path.resolve(__dirname, '../uploads/products/p-accent-chair.jpg');
  if (!fs.existsSync(sampleImagePath)) {
    console.error('❌ Sample image does not exist:', sampleImagePath);
    process.exit(1);
  }

  try {
    // 1. Visit Admin Login
    console.log('1. Navigating to Admin Login...');
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
    
    // Fill credentials (allowlist email)
    await page.fill('input[type="email"]', 'akilanr05@gmail.com');
    await page.fill('input[type="password"]', 'any-local-password');
    // Note: Since we test local fallback or mock, let's see if login works or use session directly
    console.log('   Submitted login credentials...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);

    // If redirected to dashboard or still on login
    console.log('   Current URL after login attempt:', page.url());

    // 2. Test Customer Pages Image Display
    console.log('\n2. Testing Customer Pages Image Display...');
    
    // Homepage
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const homeImgs = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
      return {
        total: imgs.length,
        broken: imgs.filter(i => i.complete && i.naturalWidth === 0).length,
      };
    });
    console.log(`   Homepage: ${homeImgs.total} images loaded, ${homeImgs.broken} broken.`);

    // Product List Page
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });
    const productListImgs = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('.product-card img')) as HTMLImageElement[];
      return {
        cards: document.querySelectorAll('.product-card').length,
        imgs: imgs.length,
        broken: imgs.filter(i => i.complete && i.naturalWidth === 0).length,
      };
    });
    console.log(`   Products Page: ${productListImgs.cards} product cards, ${productListImgs.imgs} images, ${productListImgs.broken} broken.`);

    // Product Detail Page
    await page.goto(`${BASE_URL}/products/handcrafted-wooden-sofa`, { waitUntil: 'networkidle' });
    const detailState = await page.evaluate(() => {
      const noPhotoText = document.body.innerText.includes('Product photos have not been added yet');
      const galleryImgs = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
      return {
        noPhotoText,
        galleryCount: galleryImgs.length,
        broken: galleryImgs.filter(i => i.complete && i.naturalWidth === 0).length,
        imgSrcs: galleryImgs.slice(0, 3).map(i => i.src),
      };
    });
    console.log(`   Product Detail Page: No-photo message displayed? ${detailState.noPhotoText ? 'YES (BUG)' : 'NO (CORRECT)'}`);
    console.log(`   Product Detail Gallery: ${detailState.galleryCount} images, ${detailState.broken} broken.`);
    console.log(`   Sample URLs:`, detailState.imgSrcs);

    console.log('\n🎉 Realtime Image Audit & Frontend Verification Finished!');
  } finally {
    await browser.close();
  }
}

runTest().catch(console.error);
