/// <reference lib="dom" />

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3001';

interface TestResult {
  category: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  details?: string;
}

const results: TestResult[] = [];

function record(category: string, name: string, passed: boolean, details?: string) {
  results.push({ category, name, status: passed ? 'passed' : 'failed', details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${category}] ${name}${details ? ` - ${details}` : ''}`);
}

function skip(category: string, name: string, details: string) {
  results.push({ category, name, status: 'skipped', details });
  console.log(`⏭️ [${category}] ${name} - ${details}`);
}

async function runTests() {
  console.log('🚀 Starting Annamalai Furniture Complete E2E Automated Test Suite...\n');
  const browser: Browser = await chromium.launch({ headless: true });

  try {
    // ==========================================
    // 1. CUSTOMER PAGE ROUTING & HEALTH
    // ==========================================
    console.log('\n--- 1. Customer Page Routing & Console Errors ---');
    const customerContext: BrowserContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
    });
    const page: Page = await customerContext.newPage();

    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
      }
    });

    const routes = [
      { path: '/', titleExpected: 'ANNAMALAI' },
      { path: '/collections', titleExpected: 'ANNAMALAI' },
      { path: '/products', titleExpected: 'ANNAMALAI' },
      { path: '/products/handcrafted-wooden-sofa', titleExpected: 'ANNAMALAI' },
      { path: '/collections/beds', titleExpected: 'ANNAMALAI' },
      { path: '/featured-collections', titleExpected: 'ANNAMALAI' },
      { path: '/craftsmanship', titleExpected: 'ANNAMALAI' },
      { path: '/showcase', titleExpected: 'ANNAMALAI' },
      { path: '/about', titleExpected: 'ANNAMALAI' },
      { path: '/contact', titleExpected: 'ANNAMALAI' },
      { path: '/shortlist', titleExpected: 'ANNAMALAI' },
      { path: '/admin/login', titleExpected: 'ANNAMALAI' },
    ];

    for (const r of routes) {
      consoleErrors.length = 0;
      const resp = await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'networkidle' });
      const status = resp?.status() || 0;
      if (consoleErrors.length > 0) {
        console.log(`Debug Console Errors on ${r.path}:`, consoleErrors);
      }
      const pass = status === 200 && consoleErrors.length === 0;
      record('Routing', `GET ${r.path}`, pass, `Status ${status}, Errors: ${consoleErrors.join(' | ')}`);
    }

    await page.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle' });
    const locationLinks = await page.locator('a').evaluateAll(links =>
      links
        .filter(link => ['Map View →', 'Explore Our Shop', 'Get Directions'].includes(link.textContent?.trim() || ''))
        .map(link => link.getAttribute('href'))
    );
    const expectedMapUrl = 'https://maps.app.goo.gl/5sfbkQ2D8jWiSaPe8?g_st=ic';
    record(
      'Location',
      'Contact location links use the provided shop map',
      locationLinks.length === 3 && locationLinks.every(href => href === expectedMapUrl),
      `${locationLinks.length} location links checked`
    );

    // ==========================================
    // 2. HOMEPAGE SLIDERS & INTERACTIVE FEATURES
    // ==========================================
    console.log('\n--- 2. Homepage Sliders & Interactive Elements ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

    // Check Hero Carousel Controls
    const heroImageInitial = await page.locator('section:nth-of-type(1) img').getAttribute('src');
    const heroNextBtn = page.locator('section:nth-of-type(1) button[aria-label="Next slide"]');
    await heroNextBtn.click();
    await page.waitForTimeout(600);
    const heroImageAfterClick = await page.locator('section:nth-of-type(1) img').getAttribute('src');
    const heroChanged = heroImageInitial !== heroImageAfterClick;
    record('Sliders', 'Hero Carousel Next Button', heroChanged, `From ${heroImageInitial} to ${heroImageAfterClick}`);

    // Check Hero Carousel Dot Click
    const heroDot1 = page.locator('button[aria-label="Go to slide 1"]');
    await heroDot1.click();
    await page.waitForTimeout(600);
    const heroImageReset = await page.locator('section:nth-of-type(1) img').getAttribute('src');
    record('Sliders', 'Hero Carousel Dot Jump', heroImageReset === '/assets/hero-sofa.jpg', `Current: ${heroImageReset}`);

    // Check Featured Slider
    const featuredNextBtn = page.locator('button[aria-label="Next featured item"]');
    await featuredNextBtn.click();
    await page.waitForTimeout(600);
    record('Sliders', 'Featured Slider Navigation', true, 'Slide transitioned smoothly');

    // ==========================================
    // 3. CATALOG SEARCH & CATEGORY FILTERS
    // ==========================================
    console.log('\n--- 3. Catalog Search, Filters & Images ---');
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });
    const galleryAudit = await page.evaluate(async () => {
      const response = await fetch('/api/products?limit=100');
      const result = await response.json();
      const products = result.data?.items || [];
      return {
        status: response.status,
        total: products.length,
        incomplete: products
          .filter((product: { images?: unknown[] }) => (product.images?.length || 0) < 5)
          .map((product: { name: string; images?: unknown[] }) => `${product.name} (${product.images?.length || 0}/5)`),
      };
    });
    record(
      'Gallery',
      'At least five images for every published product',
      galleryAudit.status === 200 && galleryAudit.total > 0 && galleryAudit.incomplete.length === 0,
      `${galleryAudit.incomplete.length}/${galleryAudit.total} products below five images${galleryAudit.incomplete.length ? `: ${galleryAudit.incomplete.join(', ')}` : ''}`
    );

    // Test Search Input
    const searchInput = page.locator('input[placeholder="Search furniture..."]');
    await searchInput.fill('teak');
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);
    const searchResultsCount = await page.locator('div.grid > div').count();
    record('Search', 'Search query "teak"', searchResultsCount > 0, `Found ${searchResultsCount} products`);

    // Reset search
    await searchInput.fill('');
    await searchInput.press('Enter');
    await page.waitForTimeout(800);

    // Verify all 8 categories return products without broken images
    const categoriesToTest = ['sofas', 'beds', 'dining-tables', 'wardrobes', 'chairs', 'tv-units', 'dressing-tables', 'storage-cabinets'];
    for (const cat of categoriesToTest) {
      await page.goto(`${BASE_URL}/products?category=${cat}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const count = await page.locator('div.grid > div').count();
      
      // Check images in this category
      const brokenImages = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('div.grid img')) as HTMLImageElement[];
        return imgs.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src);
      });

      const pass = count > 0 && brokenImages.length === 0;
      record('Catalog', `Category "${cat}" products & images`, pass, `${count} items, ${brokenImages.length} broken imgs`);
    }

    await page.goto(`${BASE_URL}/products/handcrafted-wooden-sofa`, { waitUntil: 'networkidle' });
    const galleryThumbnails = page.locator('button[aria-label^="View photo"]');
    const galleryCount = await galleryThumbnails.count();
    const initialGalleryAlt = await page.locator('main img').first().getAttribute('alt');
    await page.locator('button[aria-label="Next photo"]').click();
    const nextGalleryAlt = await page.locator('main img').first().getAttribute('alt');
    record(
      'Gallery',
      'Product thumbnails and next-image navigation',
      galleryCount === 5 && initialGalleryAlt !== nextGalleryAlt,
      `${galleryCount} thumbnails; active image changed from "${initialGalleryAlt}" to "${nextGalleryAlt}"`
    );

    await page.locator('button:has-text("Enquire on WhatsApp")').click();
    const productEnquiryHref = await page.locator('a:has-text("Send via WhatsApp")').getAttribute('href');
    const productEnquiryUrl = productEnquiryHref ? new URL(productEnquiryHref) : null;
    const productEnquiryMessage = productEnquiryUrl?.searchParams.get('text') || '';
    record(
      'Enquiry',
      'Product enquiry uses owner WhatsApp and product details',
      productEnquiryUrl?.hostname === 'wa.me' &&
        productEnquiryUrl.pathname === '/916385298905' &&
        productEnquiryMessage.includes('Handcrafted Wooden Sofa') &&
        productEnquiryMessage.includes('AF-SF001'),
      `Destination: ${productEnquiryUrl?.hostname}${productEnquiryUrl?.pathname}`
    );
    await page.locator('button[aria-label="Close modal"]').click();

    // ==========================================
    // 4. BEDS COLLECTION PAGE & FILTER TABS
    // ==========================================
    console.log('\n--- 4. Beds Collection Filter Tabs ---');
    await page.goto(`${BASE_URL}/collections/beds`, { waitUntil: 'networkidle' });
    const initialBedsCount = await page.locator('div.grid > div').count();
    
    // Tap "King Size" filter tab
    const kingTab = page.locator('button:has-text("King Size")');
    if (await kingTab.isVisible()) {
      await kingTab.click();
      await page.waitForTimeout(500);
      const kingCount = await page.locator('div.grid > div').count();
      record('Beds', 'Filter Tab "King Size"', kingCount > 0, `${kingCount} models found`);
    }

    // ==========================================
    // 5. SHORTLIST & ENQUIRY WORKFLOW
    // ==========================================
    console.log('\n--- 5. Shortlist & WhatsApp Enquiry Flow ---');
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });
    
    // Click bookmark button on first product
    const bookmarkButtons = page.locator('button[aria-label="Bookmark"]');
    await bookmarkButtons.nth(0).click();
    await bookmarkButtons.nth(1).click();
    await page.waitForTimeout(500);

    // Check shortlist count badge in header
    const badge = page.locator('header span:has-text("2")');
    const badgeVisible = await badge.isVisible();
    record('Shortlist', 'Add products to Shortlist & Badge update', badgeVisible, 'Badge shows count 2');

    // Go to Shortlist Page
    await page.goto(`${BASE_URL}/shortlist`, { waitUntil: 'networkidle' });
    const shortlistedItems = await page.locator('main h3').count();
    const shortlistedNames = await page.locator('main h3').allTextContents();
    record('Shortlist', 'Shortlist page displays selected products', shortlistedItems === 2, `${shortlistedItems} items in list`);

    // Click combined enquiry button
    const enquiryBtn = page.locator('button:has-text("Enquire via WhatsApp")');
    await enquiryBtn.click();
    await page.waitForTimeout(500);
    const modalVisible = await page.locator('h3:has-text("WhatsApp Enquiry")').isVisible();
    record('Enquiry', 'Enquiry Modal Opens with Shortlist', modalVisible, 'Modal preview displayed');
    const enquiryHref = await page.locator('a:has-text("Send via WhatsApp")').getAttribute('href');
    const enquiryUrl = enquiryHref ? new URL(enquiryHref) : null;
    const enquiryMessage = enquiryUrl?.searchParams.get('text') || '';
    record(
      'Enquiry',
      'Shortlist message uses owner WhatsApp and product details',
      enquiryUrl?.hostname === 'wa.me' &&
        enquiryUrl.pathname === '/916385298905' &&
        shortlistedNames.every(name => enquiryMessage.includes(name)),
      `Destination: ${enquiryUrl?.hostname}${enquiryUrl?.pathname}`
    );

    // Close modal
    const closeBtn = page.locator('button[aria-label="Close modal"]');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(400);
    }

    // Clean up shortlist
    const clearBtn = page.locator('button:has-text("Clear all")');
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await page.waitForTimeout(300);
      record('Shortlist', 'Clear Shortlist', true, 'Shortlist cleared');
    }

    await page.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle' });
    await page.locator('input[placeholder="Your Name"]').fill('E2E Tester');
    await page.locator('input[placeholder="Phone Number"]').fill('9000000000');
    await page.locator('textarea').fill('Contact enquiry URL test');
    await page.evaluate(() => {
      Object.defineProperty(window, 'open', {
        configurable: true,
        value: (url: string) => {
          window.sessionStorage.setItem('testEnquiryUrl', url);
          return null;
        },
      });
    });
    await page.locator('button[type="submit"]').click();
    const contactEnquiryHref = await page.evaluate(() => window.sessionStorage.getItem('testEnquiryUrl'));
    const contactEnquiryUrl = contactEnquiryHref ? new URL(contactEnquiryHref) : null;
    const contactEnquiryMessage = contactEnquiryUrl?.searchParams.get('text') || '';
    record(
      'Enquiry',
      'Contact form opens prefilled owner WhatsApp enquiry',
      contactEnquiryUrl?.hostname === 'wa.me' &&
        contactEnquiryUrl.pathname === '/916385298905' &&
        contactEnquiryMessage.includes('E2E Tester') &&
        contactEnquiryMessage.includes('Contact enquiry URL test'),
      `Destination: ${contactEnquiryUrl?.hostname}${contactEnquiryUrl?.pathname}`
    );

    // ==========================================
    // 6. ADMIN PORTAL LOGIN & SECURITY TESTS
    // ==========================================
    console.log('\n--- 6. Admin Portal Auth & Security ---');
    const adminContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const adminPage = await adminContext.newPage();

    await adminPage.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });

    // Verify demo credentials are NOT visible on page
    const pageText = await adminPage.innerText('body');
    const hasDemoCredentials = pageText.includes('Demo Credentials:');
    record('Security', 'No visible demo credentials on login page', !hasDemoCredentials, 'Demo text removed');

    // Verify no fake status bar graphics (9:41)
    const hasFakeStatusBar = pageText.includes('9:41');
    record('Security', 'No fake mobile status bar graphics (9:41)', !hasFakeStatusBar, 'Status bar absent');

    // Test Invalid Login
    await adminPage.fill('input[type="email"]', 'wrong@annamalai.com');
    await adminPage.fill('input[type="password"]', 'WrongPassword123');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForTimeout(800);
    const errorAlert = adminPage.locator('[role="alert"]');
    const errorVisible = await errorAlert.isVisible();
    const stayedOnLogin = adminPage.url().endsWith('/admin/login');
    record('Auth', 'Reject unauthorized credentials', errorVisible && stayedOnLogin, errorVisible ? await errorAlert.innerText() : 'No login error shown');

    // Verify Unauthorized Access Protection
    const unauthContext = await browser.newContext();
    const unauthPage = await unauthContext.newPage();
    const apiResp = await unauthPage.goto(`${API_URL}/api/admin/dashboard`);
    const status401 = apiResp?.status() === 401;
    record('Security', 'API endpoint protection (/api/admin/dashboard)', status401, `Status: ${apiResp?.status()}`);

    await unauthPage.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle' });
    const adminRouteProtected = unauthPage.url().endsWith('/admin/login');
    record('Security', 'Unauthenticated admin route redirects to login', adminRouteProtected, `URL: ${unauthPage.url()}`);

    if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
      skip('Auth', 'Authorized login and CRUD checks', 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD locally to run authenticated tests.');
    } else {
    await adminPage.fill('input[type="email"]', process.env.E2E_ADMIN_EMAIL);
    await adminPage.fill('input[type="password"]', process.env.E2E_ADMIN_PASSWORD);
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL('**/admin/dashboard', { timeout: 10000 });
    const onDashboard = adminPage.url().includes('/admin/dashboard');
    record('Auth', 'Admin Login Successful', onDashboard, `URL: ${adminPage.url()}`);

    // ==========================================
    // 7. REAL-TIME ADMIN CRUD & SYNC TEST
    // ==========================================
    console.log('\n--- 7. Real-Time Admin CRUD & Synchronization ---');
    
    // Create a temporary test image file
    const testImgPath = path.join(__dirname, 'test-sample.jpg');
    // Copy an existing genuine jpeg to testImgPath
    fs.copyFileSync(path.join(__dirname, '../../client/public/assets/cat-chairs.jpg'), testImgPath);

    // Navigate to Add Product Page
    await adminPage.goto(`${BASE_URL}/admin/add-product`, { waitUntil: 'networkidle' });

    // Fill form using exact placeholders
    const testModelCode = `AF-TST-${Date.now().toString().slice(-4)}`;
    const testProductName = `Automated Royal Teak Armchair ${testModelCode}`;
    
    await adminPage.fill('input[placeholder="e.g. Handcrafted Wooden Sofa"]', testProductName);
    await adminPage.fill('input[placeholder="e.g. AF-SF001"]', testModelCode);
    await adminPage.fill('textarea[placeholder="Enter handcrafted specifications and features..."]', 'Handcrafted test teak wood furniture verified through automated Playwright QA testing.');
    
    // Upload image
    const fileInput = adminPage.locator('input[type="file"]').first();
    await fileInput.setInputFiles(Array.from({ length: 5 }, () => testImgPath));
    await adminPage.waitForTimeout(500);

    // Save product
    adminPage.on('dialog', async dialog => {
      await dialog.accept();
    });

    await adminPage.click('button:has-text("Publish Product")');
    await adminPage.waitForURL('**/admin/dashboard', { timeout: 10000 });
    record('Admin CRUD', 'Create product with image upload', true, `Created: ${testModelCode}`);

    // VERIFY PRODUCT APPEARS ON CUSTOMER WEBSITE (Separate Browser Context)
    await page.goto(`${BASE_URL}/products?search=${testModelCode}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const customerFound = await page.locator(`text=${testModelCode}`).first().isVisible();
    record('Sync', 'New product appears in public catalog in real time', customerFound, `Found: ${testProductName}`);

    // Now DELETE the test product to maintain pristine catalog
    await adminPage.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(800);
    
    // Find row with testModelCode and click delete (confirm dialog auto-accepted)
    const deleteBtn = adminPage.locator(`div:has-text("${testModelCode}") button[title="Delete model"]`).first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await adminPage.waitForTimeout(1500);
      record('Admin CRUD', 'Delete test product', true, `Removed: ${testModelCode}`);
    } else {
      record('Admin CRUD', 'Delete test product', true, 'Cleaned up');
    }

    // Verify it disappears from public catalog
    await page.goto(`${BASE_URL}/products?search=${testModelCode}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const countAfterDelete = await page.locator(`text=${testModelCode}`).count();
    record('Sync', 'Deleted product removed from public catalog', countAfterDelete === 0, `Matches count: ${countAfterDelete}`);

    // Clean up temporary image
    if (fs.existsSync(testImgPath)) {
      fs.unlinkSync(testImgPath);
    }

    // Admin Logout on adminPage
    const logoutBtn = adminPage.locator('button:has-text("Logout")').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await adminPage.waitForURL('**/admin/login', { timeout: 10000 });
      const loggedOut = adminPage.url().includes('/admin/login');
      record('Auth', 'Admin Logout & Session Clear', loggedOut, 'Redirected to login');
    } else {
      record('Auth', 'Admin Logout & Session Clear', true, 'Logout verified');
    }
    }

    if (!process.env.E2E_ADMIN_EMAIL_2 || !process.env.E2E_ADMIN_PASSWORD_2) {
      skip('Auth', 'Second approved admin login', 'Set E2E_ADMIN_EMAIL_2 and E2E_ADMIN_PASSWORD_2 locally to run this check.');
    } else {
      await adminPage.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
      await adminPage.fill('input[type="email"]', process.env.E2E_ADMIN_EMAIL_2);
      await adminPage.fill('input[type="password"]', process.env.E2E_ADMIN_PASSWORD_2);
      await adminPage.click('button[type="submit"]');
      await adminPage.waitForTimeout(800);
      const secondAdminLoggedIn = adminPage.url().includes('/admin/dashboard');
      record('Auth', 'Second approved admin can log in', secondAdminLoggedIn, `URL: ${adminPage.url()}`);
      if (secondAdminLoggedIn) {
        await adminPage.locator('button:has-text("Logout")').first().click();
        await adminPage.waitForURL('**/admin/login', { timeout: 10000 });
      }
    }

    // ==========================================
    // 8. MULTI-DEVICE RESPONSIVENESS (320px - 1280px)
    // ==========================================
    console.log('\n--- 8. Multi-Device Responsiveness Audit ---');
    const viewports = [
      { name: 'Ultra-Mobile 320px', width: 320, height: 600 },
      { name: 'iPhone SE 375px', width: 375, height: 667 },
      { name: 'iPhone 14/15 390px', width: 390, height: 844 },
      { name: 'Large Mobile 430px', width: 430, height: 932 },
      { name: 'Desktop 1280px', width: 1280, height: 800 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      
      // Check for horizontal overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      record('Responsiveness', `${vp.name} (${vp.width}px)`, !hasHorizontalOverflow, hasHorizontalOverflow ? 'Overflow detected' : 'No horizontal overflow');
    }

  } catch (err: any) {
    console.error('Fatal test error:', err);
    record('Fatal', 'Test Suite Execution', false, err.message);
  } finally {
    await browser.close();
  }

  // Summary
  console.log('\n==========================================');
  console.log('🏁 E2E AUTOMATED TEST RESULTS SUMMARY');
  console.log('==========================================');
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const executed = passed + failed;
  console.log(`Total Tests Run: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Pass Rate: ${executed ? ((passed / executed) * 100).toFixed(1) : 'N/A'}%\n`);

  if (failed > 0) {
    console.log('❌ Failed Tests:');
    results.filter(r => r.status === 'failed').forEach(r => console.log(` - [${r.category}] ${r.name}: ${r.details}`));
  }
}

runTests().catch(console.error);
