const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

const baseUrl = process.env.QA_BASE_URL || 'http://localhost:5173';
const apiUrl = process.env.QA_API_URL || 'http://localhost:3001';
const resultDirectory = path.resolve(__dirname, '../test-results');
const results = [];
const browserErrors = [];
const browserWarnings = [];
let page;

async function check(name, run) {
  try {
    const details = await run();
    results.push({ name, status: 'PASS', details: details || undefined });
  } catch (error) {
    const screenshot = path.join(resultDirectory, `${String(results.length + 1).padStart(3, '0')}-failure.png`);
    if (page) {
      try {
        await page.screenshot({ path: screenshot, fullPage: true, timeout: 5000 });
      } catch {
        // The browser may have closed while a failed check was being recorded.
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

async function expectPage(pageInstance, route) {
  const response = await pageInstance.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
  if (!response || !response.ok()) throw new Error(`Expected successful page response; got ${response?.status() ?? 'no response'}`);
  const bodyText = await pageInstance.locator('body').innerText();
  if (!bodyText.trim()) throw new Error('Page rendered no visible text');
  await pageInstance.waitForTimeout(1100);
}

async function main() {
  await fs.mkdir(resultDirectory, { recursive: true });
  const response = await fetch(`${apiUrl}/api/products`);
  if (!response.ok) throw new Error(`Catalog API unavailable: HTTP ${response.status}`);
  const catalog = await response.json();
  const products = catalog?.data?.items;
  if (!Array.isArray(products) || !products.length) throw new Error('Catalog API returned no products');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => {
    window.__qaOpenedUrls = [];
    window.open = url => {
      window.__qaOpenedUrls.push(String(url));
      return null;
    };
  });
  page = await context.newPage();
  page.on('pageerror', error => browserErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') browserErrors.push(message.text());
    if (message.type() === 'warning') browserWarnings.push(message.text());
  });
  page.on('requestfailed', request => {
    if (!/fonts\.(googleapis|gstatic)\.com/.test(request.url())) {
      browserErrors.push(`Request failed: ${request.url()} (${request.failure()?.errorText || 'unknown'})`);
    }
  });

  await check('API health, products, categories, public settings', async () => {
    const health = await fetch(`${apiUrl}/api/health`);
    const categories = await fetch(`${apiUrl}/api/categories`);
    const settings = await fetch(`${apiUrl}/api/settings/public`);
    for (const [label, result] of [['health', health], ['categories', categories], ['settings', settings]]) {
      if (!result.ok) throw new Error(`${label} API returned HTTP ${result.status}`);
    }
    return `products=${products.length}`;
  });

  const routes = [
    '/', '/collections', '/collections/beds', '/products', '/shortlist', '/about',
    '/contact', '/craftsmanship', '/showcase', '/testimonials', '/featured-collections',
  ];
  for (const route of routes) {
    await check(`Route ${route} at mobile, tablet, desktop`, async () => {
      for (const width of [390, 768, 1280]) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        await expectPage(page, route);
        const layout = await page.evaluate(() => ({
          viewport: window.innerWidth,
          document: document.documentElement.scrollWidth,
          brokenImages: Array.from(document.images)
            .filter(image => image.complete && image.naturalWidth === 0)
            .map(image => image.currentSrc || image.src),
          emptyAlt: Array.from(document.images).filter(image => !image.hasAttribute('alt')).length,
        }));
        if (layout.document > layout.viewport + 2) throw new Error(`Horizontal overflow at ${width}px (${layout.document}px)`);
        if (layout.brokenImages.length) throw new Error(`Broken images: ${layout.brokenImages.join(', ')}`);
        if (layout.emptyAlt) throw new Error(`${layout.emptyAlt} images are missing alt attributes`);
      }
      return '390px, 768px, and 1280px';
    });
  }

  for (const product of products) {
    await check(`Product page ${product.slug} at mobile, tablet, desktop`, async () => {
      for (const width of [390, 768, 1280]) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        await expectPage(page, `/products/${encodeURIComponent(product.slug)}`);
        await page.getByRole('heading', { name: product.name, exact: true }).waitFor();
        const gallery = page.locator('[aria-label="Product photos"]');
        const count = await gallery.locator('button[aria-label^="Open photo"]').count();
        if (count !== product.images.length) throw new Error(`Gallery shows ${count}/${product.images.length} images`);
        const galleryState = await gallery.evaluate(element => ({
          width: element.clientWidth,
          scrollWidth: element.scrollWidth,
          broken: Array.from(element.querySelectorAll('img')).filter(image => !image.complete || image.naturalWidth === 0).length,
        }));
        if (galleryState.broken) throw new Error(`${galleryState.broken} gallery images failed to load`);
        if (width === 390 && product.images.length > 1 && galleryState.scrollWidth <= galleryState.width) {
          throw new Error('Multi-image gallery does not scroll horizontally on mobile');
        }
        if ([product.length, product.width, product.height].some(value => value == null)) {
          const dimensions = await page.locator('[aria-label="Product dimensions"]').innerText();
          if (!dimensions.includes('Needs to be provided')) throw new Error('Unavailable dimensions are not clearly disclosed');
        }
      }
      return `${product.images.length} image(s)`;
    });
  }

  await check('Header menu destinations', async () => {
    const destinations = [
      ['Handcrafted Catalog', '/products'],
      ['Beds Collection', '/collections/beds'],
      ['About Our Craft', '/about'],
      ['Contact & Showroom', '/contact'],
    ];
    for (const [label, route] of destinations) {
      await expectPage(page, '/');
      await page.getByRole('button', { name: 'Toggle navigation menu' }).click();
      await page.getByRole('link', { name: new RegExp(label, 'i') }).click();
      if (!page.url().endsWith(route)) throw new Error(`${label} navigated to ${page.url()}`);
    }
  });

  await check('Catalog search and category filtering', async () => {
    await expectPage(page, '/products');
    const search = page.getByPlaceholder('Search furniture...');
    await search.fill('TV Unit');
    await page.waitForTimeout(300);
    if (!(await page.locator('main').innerText()).toLowerCase().includes('tv unit')) {
      throw new Error('Search did not return the TV Unit product');
    }
    await expectPage(page, '/products');
    await page.getByRole('button', { name: 'Beds', exact: true }).click();
    await page.waitForTimeout(300);
    if (!(await page.locator('main').innerText()).includes('Bed')) throw new Error('Beds filter returned no matching products');
  });

  await check('Contact form validation, WhatsApp recipient, and message fields', async () => {
    await expectPage(page, '/contact');
    const form = page.locator('form').first();
    if (await form.locator('[required]').count() < 3) throw new Error('Expected required name, phone, and message fields');
    await form.getByRole('button', { name: /Send via WhatsApp/i }).click();
    if (!(await form.locator(':invalid').count())) throw new Error('Empty enquiry submitted without validation');
    await page.getByPlaceholder('Your Name').fill('QA Sample');
    await page.getByPlaceholder('Phone Number').fill('9876543210');
    await page.getByPlaceholder('Your Message').fill('Automated enquiry flow check');
    await form.getByRole('button', { name: /Send via WhatsApp/i }).click();
    const opened = await page.evaluate(() => window.__qaOpenedUrls.slice(-1)[0]);
    const url = new URL(opened);
    const message = url.searchParams.get('text') || '';
    if (url.origin !== 'https://wa.me' || url.pathname !== '/916385298905') throw new Error(`Unexpected WhatsApp target ${opened}`);
    for (const value of ['QA Sample', '9876543210', 'Automated enquiry flow check']) {
      if (!message.includes(value)) throw new Error(`Prefilled WhatsApp message omitted "${value}"`);
    }
  });

  await check('Product enquiry destination and model details', async () => {
    const product = products.find(item => item.images.length > 1) || products[0];
    await expectPage(page, `/products/${encodeURIComponent(product.slug)}`);
    await page.getByRole('button', { name: /Enquire on WhatsApp/i }).click();
    const href = await page.getByRole('link', { name: 'Send via WhatsApp' }).getAttribute('href');
    const url = new URL(href);
    if (url.origin !== 'https://wa.me' || url.pathname !== '/916385298905') throw new Error(`Unexpected WhatsApp target ${href}`);
    if (!(url.searchParams.get('text') || '').includes(product.modelCode)) throw new Error('Product model code missing from enquiry');
  });

  await check('Shortlist add and persistence', async () => {
    const product = products[0];
    await expectPage(page, `/products/${encodeURIComponent(product.slug)}`);
    await page.getByRole('button', { name: 'Add to shortlist' }).click();
    await expectPage(page, '/shortlist');
    if (!(await page.getByText(product.name, { exact: true }).count())) throw new Error('Product was not retained in shortlist');
  });

  await check('Public map links use the configured shop destination', async () => {
    await expectPage(page, '/contact');
    const urls = await page.locator('a[href^="https://maps.app.goo.gl/"]').evaluateAll(links => links.map(link => link.href));
    const expected = 'https://maps.app.goo.gl/5sfbkQ2D8jWiSaPe8?g_st=ic';
    if (!urls.length || urls.some(url => url !== expected)) throw new Error(`Unexpected shop map links: ${JSON.stringify(urls)}`);
  });

  await check('Unauthorized admin route and API remain protected', async () => {
    await expectPage(page, '/admin/dashboard');
    if (!page.url().includes('/admin/login')) throw new Error(`Dashboard was not redirected (${page.url()})`);
    const adminResponse = await page.request.get(`${apiUrl}/api/products/admin/all`);
    if (adminResponse.status() !== 401) throw new Error(`Admin API returned HTTP ${adminResponse.status()}, expected 401`);
  });

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    apiUrl,
    productsChecked: products.length,
    productImageRecords: products.reduce((sum, product) => sum + product.images.length, 0),
    passed: results.filter(result => result.status === 'PASS').length,
    failed: results.filter(result => result.status === 'FAIL').length,
    browserErrors: Array.from(new Set(browserErrors)),
    browserWarnings: Array.from(new Set(browserWarnings)),
    results,
  };
  await fs.writeFile(path.join(resultDirectory, 'qa-e2e-results.json'), `${JSON.stringify(summary, null, 2)}\n`);
  await fs.writeFile(path.join(resultDirectory, 'qa-e2e-report.md'), [
    '# ANNAMALAI FURNITURE — Playwright QA Results',
    '',
    `- Run: ${summary.generatedAt}`,
    `- Frontend: ${baseUrl}`,
    `- API: ${apiUrl}`,
    `- Products: ${summary.productsChecked}; image records: ${summary.productImageRecords}`,
    `- Passed: ${summary.passed}; failed: ${summary.failed}`,
    `- Browser errors observed: ${summary.browserErrors.length}`,
    `- Browser warnings observed: ${summary.browserWarnings.length}`,
    '',
    '## Test cases',
    ...results.map(result => `- **${result.status}** ${result.name}${result.error ? ` — ${result.error}` : ''}`),
    '',
    '## Browser errors',
    ...(summary.browserErrors.length ? summary.browserErrors.map(error => `- ${error}`) : ['- None']),
    '',
    '## Browser warnings',
    ...(summary.browserWarnings.length ? summary.browserWarnings.map(warning => `- ${warning}`) : ['- None']),
    '',
    'Authenticated admin CRUD, uploads, and public synchronization are covered in qa-admin-e2e-report.md. Product photo identity still requires verified product-specific source images.',
    '',
  ].join('\n'));

  console.log(JSON.stringify({
    passed: summary.passed,
    failed: summary.failed,
    productsChecked: summary.productsChecked,
    productImageRecords: summary.productImageRecords,
    browserErrors: summary.browserErrors,
    browserWarnings: summary.browserWarnings,
    report: path.join(resultDirectory, 'qa-e2e-report.md'),
    results: path.join(resultDirectory, 'qa-e2e-results.json'),
    failures: results.filter(result => result.status === 'FAIL'),
  }, null, 2));
  await context.close();
  await browser.close();
  if (summary.failed || summary.browserErrors.length) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
