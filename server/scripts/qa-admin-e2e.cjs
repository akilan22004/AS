const fs = require('node:fs/promises');
const path = require('node:path');
const dotenv = require('dotenv');
const sharp = require('sharp');
const { PrismaClient } = require('@prisma/client');
const { chromium } = require('playwright');
require('ts-node/register/transpile-only');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.admin.local'), override: true });

const baseUrl = process.env.QA_BASE_URL || 'http://localhost:5173';
const apiUrl = process.env.QA_API_URL || 'http://localhost:3001';
const email = process.env.QA_ADMIN_EMAIL;
const password = process.env.QA_ADMIN_PASSWORD;
const resultDirectory = path.resolve(__dirname, '../test-results');
const prisma = new PrismaClient();
const results = [];
const browserErrors = [];
let browser;
let context;
let page;
let categoryId;
let productId;
let categoryName;
let productName;
let productSlug;
let baselineStats;
let adminAuthenticated = false;

async function check(name, run) {
  try {
    const detail = await run();
    if (detail && typeof detail === 'object' && detail.status === 'BLOCKED') {
      results.push({ name, status: 'BLOCKED', reason: detail.reason });
      return;
    }
    results.push({ name, status: 'PASS', detail: detail || undefined });
  } catch (error) {
    const screenshot = path.join(resultDirectory, `admin-${String(results.length + 1).padStart(2, '0')}-failure.png`);
    if (page) {
      try {
        await page.screenshot({ path: screenshot, fullPage: true, timeout: 5000 });
      } catch {
        // The browser may have closed while recording the failure.
      }
    }
    results.push({
      name,
      status: 'FAIL',
      error: error instanceof Error ? error.message : String(error),
      screenshot: path.relative(resultDirectory, screenshot),
    });
  }
}

async function adminProduct(id = productId) {
  const response = await adminGet(`${apiUrl}/api/products/admin/${encodeURIComponent(id)}`);
  if (!response.ok()) throw new Error(`Admin product API returned HTTP ${response.status()}`);
  const body = await response.json();
  return body.data;
}

async function adminGet(url) {
  const authorization = await getAdminAuthorizationHeader();
  return page.request.get(url, { headers: authorization });
}

async function adminDelete(url) {
  const authorization = await getAdminAuthorizationHeader();
  return page.request.delete(url, { headers: authorization });
}

async function getAdminAuthorizationHeader() {
  const accessToken = await page.evaluate(() => {
    for (const key of Object.keys(sessionStorage)) {
      if (!key.endsWith('-auth-token')) continue;
      try {
        const session = JSON.parse(sessionStorage.getItem(key) || '');
        if (typeof session.access_token === 'string') return session.access_token;
      } catch {
        continue;
      }
    }
    return null;
  });
  if (!accessToken) throw new Error('No Supabase session is available for the protected API request.');
  return { Authorization: `Bearer ${accessToken}` };
}

async function publicProduct(slug = productSlug) {
  const response = await page.request.get(`${apiUrl}/api/products/${encodeURIComponent(slug)}`);
  if (!response.ok()) throw new Error(`Public product API returned HTTP ${response.status()}`);
  const body = await response.json();
  return body.data.product;
}

async function gotoProductEditor() {
  await page.goto(`${baseUrl}/admin/products/${encodeURIComponent(productId)}/edit`, { waitUntil: 'networkidle' });
  await page.getByPlaceholder('Enter handcrafted specifications and features...').waitFor();
}

async function dismissDialogs() {
  page.on('dialog', dialog => dialog.accept());
}

async function main() {
  if (!email || !password) throw new Error('QA Supabase Auth admin credentials are missing from server/.env.admin.local.');
  if (process.env.NODE_ENV !== 'development' || !/^file:/i.test(process.env.DATABASE_URL || '')) {
    throw new Error('Admin E2E is restricted to development with a local SQLite database.');
  }
  await fs.mkdir(resultDirectory, { recursive: true });

  const sourceImage = path.resolve(__dirname, '../uploads/products/p-detail-sofa-main.jpg');
  const variantImage = path.join(resultDirectory, 'qa-sofa-upload-variant.jpg');
  await sharp(sourceImage).modulate({ brightness: 0.99 }).jpeg({ quality: 92 }).toFile(variantImage);

  const timestamp = Date.now().toString(36);
  categoryName = `QA Temporary Category ${timestamp}`;
  const updatedCategoryName = `QA Updated Category ${timestamp}`;
  productName = `QA Temporary Sofa ${timestamp}`;
  const updatedProductName = `QA Updated Sofa ${timestamp}`;
  productSlug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  page = await context.newPage();
  page.on('pageerror', error => browserErrors.push(`Uncaught page error: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });
  page.on('requestfailed', request => {
    const reason = request.failure()?.errorText || 'unknown';
    if (!/fonts\.(googleapis|gstatic)\.com/.test(request.url()) && reason !== 'net::ERR_ABORTED') {
      browserErrors.push(`Request failed: ${request.url()} (${reason})`);
    }
  });
  dismissDialogs();

  try {
    await check('Admin authentication and dashboard access', async () => {
      await page.goto(`${baseUrl}/admin/login`, { waitUntil: 'networkidle' });
      await page.getByPlaceholder('Email Address').fill(email);
      await page.getByPlaceholder('Password').fill(password);
      if (await page.getByLabel(/authenticator|6-digit|verification code/i).count()) {
        throw new Error('The Admin Portal unexpectedly requires an authenticator code.');
      }
      await page.getByRole('button', { name: 'Secure Login' }).click();
      await page.waitForURL('**/admin/dashboard', { timeout: 15000 });
      await page.getByText('Furniture Models').waitFor();
      const protectedResponse = await adminGet(`${apiUrl}/api/products/admin/all`);
      if (!protectedResponse.ok()) throw new Error(`Authenticated admin API returned HTTP ${protectedResponse.status()}`);
      const statsResponse = await adminGet(`${apiUrl}/api/admin/dashboard`);
      if (!statsResponse.ok()) throw new Error(`Admin dashboard stats returned HTTP ${statsResponse.status()}`);
      baselineStats = (await statsResponse.json()).data;
      adminAuthenticated = true;
      return 'Login succeeded; dashboard and protected catalog API loaded';
    });

    await check('Admin pages responsive at mobile, tablet, and desktop widths', async () => {
      if (!adminAuthenticated) {
        return { status: 'BLOCKED', reason: 'Admin authentication did not pass; protected page responsiveness cannot be verified.' };
      }
      for (const route of ['/admin/dashboard', '/admin/categories', '/admin/products/new', '/admin/media']) {
        for (const width of [390, 768, 1280]) {
          await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
          await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
          const layout = await page.evaluate(() => ({
            viewport: window.innerWidth,
            document: document.documentElement.scrollWidth,
            brokenImages: Array.from(document.images)
              .filter(image => image.complete && image.naturalWidth === 0)
              .map(image => image.currentSrc || image.src),
          }));
          if (layout.document > layout.viewport + 2) throw new Error(`${route} overflows horizontally at ${width}px`);
          if (layout.brokenImages.length) throw new Error(`${route} has broken images: ${layout.brokenImages.join(', ')}`);
        }
      }
      await page.setViewportSize({ width: 1280, height: 900 });
      return 'Dashboard, categories, product form, and media library at 390px, 768px, and 1280px';
    });

    await check('Temporary category create and edit in Admin Portal', async () => {
      if (!adminAuthenticated) {
        return { status: 'BLOCKED', reason: 'Admin authentication did not pass; category CRUD requires an authenticated session.' };
      }
      await page.goto(`${baseUrl}/admin/categories`, { waitUntil: 'networkidle' });
      await page.getByPlaceholder('Category name').fill(categoryName);
      await page.getByPlaceholder('Description').fill('Temporary automated CRUD test category');
      await page.getByRole('button', { name: 'Create category' }).click();
      const categoryEditButton = page.getByRole('button', { name: `Edit ${categoryName}` });
      await categoryEditButton.waitFor();
      await categoryEditButton.click();
      const editForm = page.locator('form').filter({ has: page.getByRole('button', { name: 'Save' }) });
      await editForm.locator('input').nth(0).fill(updatedCategoryName);
      await editForm.locator('input').nth(1).fill(updatedCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      await editForm.locator('textarea').fill('Updated temporary category details');
      await editForm.getByRole('button', { name: 'Save' }).click();
      const response = await adminGet(`${apiUrl}/api/categories/admin/all`);
      if (!response.ok()) throw new Error(`Admin categories API returned HTTP ${response.status()}`);
      const category = await prisma.category.findUnique({
        where: { slug: updatedCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
      });
      if (!category) throw new Error('Edited category did not persist through the admin API');
      const categoryData = (await response.json()).data;
      const categories = Array.isArray(categoryData) ? categoryData : categoryData.items;
      if (!Array.isArray(categories) || !categories.some(item => item.id === category.id)) {
        throw new Error('Edited category was missing from the authenticated admin API');
      }
      categoryId = category.id;
      return 'Create, edit, and database synchronization verified';
    });

    await check('Admin product creation, image upload, and public synchronization', async () => {
      if (!adminAuthenticated) {
        return { status: 'BLOCKED', reason: 'Admin authentication did not pass; product creation requires an authenticated session.' };
      }
      if (!categoryId) {
        return { status: 'BLOCKED', reason: 'Category CRUD prerequisite did not pass' };
      }
      await page.goto(`${baseUrl}/admin/products/new`, { waitUntil: 'networkidle' });
      await page.getByPlaceholder('e.g. Handcrafted Wooden Sofa').fill(productName);
      await page.getByPlaceholder('e.g. AF-SF001').fill(`QA-${timestamp}`);
      await page.locator('select').first().selectOption(categoryId);
      await page.getByPlaceholder('Enter handcrafted specifications and features...').fill('Temporary end-to-end verification record; not a business listing.');
      await page.locator('input[type="file"]').first().setInputFiles(sourceImage);
      await page.getByRole('button', { name: 'Publish Product' }).click();
      await page.waitForURL('**/admin/dashboard', { timeout: 20000 });

      const adminResponse = await adminGet(`${apiUrl}/api/products/admin/all?search=${encodeURIComponent(productName)}`);
      if (!adminResponse.ok()) throw new Error(`Admin product list returned HTTP ${adminResponse.status()}`);
      const product = (await adminResponse.json()).data.items.find(item => item.name === productName);
      if (!product) throw new Error('Created product was not present in the admin database view');
      productId = product.id;
      await page.getByRole('heading', { name: productName, exact: true }).waitFor();
      const statsResponse = await adminGet(`${apiUrl}/api/admin/dashboard`);
      if (!statsResponse.ok()) throw new Error(`Admin dashboard stats returned HTTP ${statsResponse.status()}`);
      const stats = (await statsResponse.json()).data;
      if (stats.totalProducts !== baselineStats.totalProducts + 1 ||
          stats.publishedProducts !== baselineStats.publishedProducts + 1 ||
          stats.totalImages !== baselineStats.totalImages + 1 ||
          stats.totalCategories !== baselineStats.totalCategories + 1) {
        throw new Error('Dashboard totals did not reflect the newly published product, category, and photo');
      }

      const persisted = await prisma.product.findUnique({
        where: { id: productId },
        include: { images: true, category: true },
      });
      if (!persisted || persisted.images.length !== 1 || persisted.category.name !== updatedCategoryName) {
        throw new Error('Product, category, or uploaded image did not persist correctly in SQLite');
      }
      const storedImage = persisted.images[0];
      const storedPath = path.isAbsolute(storedImage.filePath)
        ? storedImage.filePath
        : path.resolve(__dirname, '..', storedImage.filePath.replace(/^[/\\]?uploads[/\\]?/, 'uploads/'));
      await fs.access(storedPath);
      if (!(await fs.stat(storedPath)).size) throw new Error('Stored image file is empty');

      const publicRecord = await publicProduct();
      if (publicRecord.name !== productName || publicRecord.images.length !== 1) {
        throw new Error('Uploaded product did not synchronize to the public API');
      }
      await page.goto(`${baseUrl}/products/${encodeURIComponent(productSlug)}`, { waitUntil: 'networkidle' });
      await page.getByRole('heading', { name: productName, exact: true }).waitFor();
      const loadedImage = await page.locator('[aria-label="Product photos"] img').first().evaluate(image => ({
        src: image.currentSrc,
        width: image.naturalWidth,
        height: image.naturalHeight,
      }));
      if (!loadedImage.width || !loadedImage.height || !loadedImage.src.includes('/uploads/')) {
        throw new Error('Uploaded image did not load from backend storage on the public product page');
      }
      return 'Admin form → upload API → optimized file → SQLite → public API and product page verified';
    });

    await check('Product edit, multi-image upload, reorder, replace, and delete image', async () => {
      if (!adminAuthenticated) {
        return { status: 'BLOCKED', reason: 'Admin authentication did not pass; product updates require an authenticated session.' };
      }
      if (!productId) {
        return { status: 'BLOCKED', reason: 'Product creation prerequisite did not pass' };
      }
      await gotoProductEditor();
      await page.getByPlaceholder('e.g. Handcrafted Wooden Sofa').fill(updatedProductName);
      await page.getByPlaceholder('Enter handcrafted specifications and features...').fill('Updated QA description verified from the public product page.');
      const otherCategory = await page.locator('select').first().locator('option').evaluateAll((options, currentCategoryId) =>
        options.map(option => ({ value: option.value, text: option.textContent || '' }))
          .find(option => option.value && option.value !== currentCategoryId),
        categoryId
      );
      if (!otherCategory) throw new Error('No existing category available to verify product category updates');
      await page.locator('select').first().selectOption(otherCategory.value);
      await page.getByRole('button', { name: 'Publish Product' }).click();
      await page.waitForURL('**/admin/dashboard', { timeout: 15000 });
      const updatedSlug = updatedProductName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let updated = await publicProduct(updatedSlug);
      if (updated.description !== 'Updated QA description verified from the public product page.' ||
          updated.category.name !== otherCategory.text) {
        throw new Error('Edited product details or category did not synchronize to the public API');
      }
      productSlug = updatedSlug;

      await gotoProductEditor();
      await page.locator('input[type="file"][multiple]').first().setInputFiles([sourceImage, variantImage]);
      await page.getByRole('button', { name: 'Publish Product' }).click();
      await page.waitForURL('**/admin/dashboard', { timeout: 15000 });
      updated = await adminProduct();
      if (updated.images.length !== 3) throw new Error(`Expected 3 saved images after upload; got ${updated.images.length}`);
      const beforeReorder = updated.images.map(image => image.id);

      await gotoProductEditor();
      await page.getByRole('button', { name: 'Move image 2 up' }).click();
      await page.waitForTimeout(500);
      updated = await adminProduct();
      if (updated.images[0].id !== beforeReorder[1] || updated.images[1].id !== beforeReorder[0]) {
        throw new Error('Reordered image sequence did not persist in SQLite');
      }

      const previousPrimaryPath = updated.images[0].filePath;
      const replaceInput = page.locator('label').filter({ hasText: 'Replace' }).first().locator('input[type="file"]');
      await replaceInput.setInputFiles(variantImage);
      await page.waitForTimeout(600);
      updated = await adminProduct();
      if (updated.images[0].filePath === previousPrimaryPath) throw new Error('Image replacement did not update the stored file');

      await page.getByRole('button', { name: 'Delete image 2' }).click();
      await page.waitForTimeout(500);
      updated = await adminProduct();
      if (updated.images.length !== 2) throw new Error(`Expected 2 images after deletion; got ${updated.images.length}`);
      const published = await publicProduct();
      if (published.images.length !== 2 || published.name !== updatedProductName) {
        throw new Error('Public API did not reflect the final image gallery and edited product name');
      }
      await page.goto(`${baseUrl}/products/${encodeURIComponent(productSlug)}`, { waitUntil: 'networkidle' });
      await page.getByRole('heading', { name: updatedProductName, exact: true }).waitFor();
      const imageState = await page.locator('[aria-label="Product photos"] img').evaluateAll(images =>
        images.map(image => ({ loaded: image.complete && image.naturalWidth > 0, src: image.currentSrc }))
      );
      if (imageState.length !== 2 || imageState.some(image => !image.loaded || !image.src.includes('/uploads/'))) {
        throw new Error('Edited gallery images did not all render on the public product page');
      }
      return 'Field/category edit, multi-upload, ordering, replacement, deletion, persistence, and public gallery verified';
    });

    await check('Admin media library reflects the uploaded product gallery', async () => {
      if (!adminAuthenticated) {
        return { status: 'BLOCKED', reason: 'Admin authentication did not pass; media library access requires an authenticated session.' };
      }
      if (!productId) {
        return { status: 'BLOCKED', reason: 'Product creation prerequisite did not pass' };
      }
      await page.goto(`${baseUrl}/admin/media`, { waitUntil: 'networkidle' });
      await page.getByRole('heading', { name: 'Furniture Media Library' }).waitFor();
      await page.getByPlaceholder('Search images...').fill(updatedProductName);
      await page.getByText(updatedProductName, { exact: false }).first().waitFor();
      const images = await page.locator('main img').evaluateAll(items =>
        items.filter(image => image.complete && image.naturalWidth > 0).length
      );
      if (images < 2) throw new Error(`Expected at least 2 loaded product photos in media library; got ${images}`);
      return `${images} gallery photo(s) shown and loaded`;
    });

    await check('Temporary product/category deletion and logout', async () => {
      if (!adminAuthenticated) {
        return { status: 'BLOCKED', reason: 'Admin authentication did not pass; cleanup and logout verification require an authenticated session.' };
      }
      if (!productId || !categoryId) {
        return { status: 'BLOCKED', reason: 'Product or category creation prerequisite did not pass' };
      }
      await page.goto(`${baseUrl}/admin/dashboard`, { waitUntil: 'networkidle' });
      const productCard = page.getByRole('heading', { name: updatedProductName, exact: true }).locator('xpath=../../..');
      await productCard.getByRole('button', { name: 'Delete model' }).click();
      await page.waitForTimeout(500);
      const deleted = await prisma.product.findUnique({ where: { id: productId } });
      if (deleted) throw new Error('Temporary product still exists in SQLite after dashboard deletion');
      const missingProduct = await page.request.get(`${apiUrl}/api/products/${encodeURIComponent(productSlug)}`);
      if (missingProduct.status() !== 404) throw new Error(`Deleted product public route returned HTTP ${missingProduct.status()}`);
      productId = undefined;
      const productStatsResponse = await adminGet(`${apiUrl}/api/admin/dashboard`);
      const productStats = (await productStatsResponse.json()).data;
      if (productStats.totalProducts !== baselineStats.totalProducts || productStats.totalImages !== baselineStats.totalImages) {
        throw new Error('Dashboard product/photo totals did not return to baseline after deleting the test product');
      }

      await page.goto(`${baseUrl}/admin/categories`, { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: `Delete ${updatedCategoryName}` }).click();
      await page.waitForTimeout(300);
      const deletedCategory = await prisma.category.findUnique({ where: { id: categoryId } });
      if (deletedCategory) throw new Error('Temporary category still exists in SQLite after deletion');
      categoryId = undefined;

      await page.goto(`${baseUrl}/admin/dashboard`, { waitUntil: 'networkidle' });
      const categoryStatsResponse = await adminGet(`${apiUrl}/api/admin/dashboard`);
      const categoryStats = (await categoryStatsResponse.json()).data;
      if (categoryStats.totalCategories !== baselineStats.totalCategories) {
        throw new Error('Dashboard category total did not return to baseline after cleanup');
      }
      await page.getByTitle('Logout').click();
      await page.waitForURL('**/admin/login', { timeout: 10000 });
      const protectedResponse = await page.request.get(`${apiUrl}/api/products/admin/all`);
      if (protectedResponse.status() !== 401) throw new Error(`Admin API after logout returned HTTP ${protectedResponse.status()}`);
      return 'Test records removed from database; logout invalidated protected access';
    });
  } finally {
    if (page && productId) {
      try {
        await adminDelete(`${apiUrl}/api/products/${encodeURIComponent(productId)}`);
      } catch {}
    }
    if (page && categoryId) {
      try {
        await adminDelete(`${apiUrl}/api/categories/${encodeURIComponent(categoryId)}`);
      } catch {}
    }
    if (context) await context.close();
    if (browser) await browser.close();
    await prisma.$disconnect();
    await fs.rm(variantImage, { force: true });
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    passed: results.filter(result => result.status === 'PASS').length,
    failed: results.filter(result => result.status === 'FAIL').length,
    blocked: results.filter(result => result.status === 'BLOCKED').length,
    browserErrors: Array.from(new Set(browserErrors)),
    results,
  };
  if (summary.browserErrors.length) {
    summary.failed += 1;
    summary.results.push({
      name: 'Admin browser console and network errors',
      status: 'FAIL',
      error: summary.browserErrors.join('; '),
    });
  } else {
    summary.results.push({ name: 'Admin browser console and network errors', status: 'PASS' });
    summary.passed += 1;
  }
  await fs.writeFile(path.join(resultDirectory, 'qa-admin-e2e-results.json'), `${JSON.stringify(summary, null, 2)}\n`);
  await fs.writeFile(path.join(resultDirectory, 'qa-admin-e2e-report.md'), [
    '# ANNAMALAI FURNITURE — Admin Portal E2E Results',
    '',
    `- Run: ${summary.generatedAt}`,
    `- Passed: ${summary.passed}; failed: ${summary.failed}; blocked: ${summary.blocked}`,
    '',
    ...summary.results.map(result => `- **${result.status}** ${result.name}${result.error ? ` — ${result.error}` : result.detail ? ` — ${result.detail}` : ''}`),
    '',
    '## Browser errors',
    ...(summary.browserErrors.length ? summary.browserErrors.map(error => `- ${error}`) : ['- None']),
    '',
  ].join('\n'));
  console.log(JSON.stringify({
    passed: summary.passed,
    failed: summary.failed,
    blocked: summary.blocked,
    browserErrors: summary.browserErrors,
    report: path.join(resultDirectory, 'qa-admin-e2e-report.md'),
    results: path.join(resultDirectory, 'qa-admin-e2e-results.json'),
    failures: results.filter(result => result.status === 'FAIL'),
  }, null, 2));
  if (summary.failed) process.exitCode = 1;
}

main().catch(async error => {
  console.error(error instanceof Error ? error.message : String(error));
  await prisma.$disconnect();
  process.exitCode = 1;
});
