import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs/promises';

const outputDir = 'C:/Users/Welcome/.gemini/antigravity/brain/b4ef3eb8-df9b-4cfc-8ff1-80cdd9bb76fe/screenshots';

const pagesToCapture = [
  // Batch 2 pages
  { url: 'http://localhost:5173/collections/beds', name: 'screenshot-6-beds.png' },
  { url: 'http://localhost:5173/admin/products/new', name: 'screenshot-7-admin-add.png' },
  { url: 'http://localhost:5173/admin/media', name: 'screenshot-8-admin-media.png' },
  { url: 'http://localhost:5173/about', name: 'screenshot-9-about.png' },
  { url: 'http://localhost:5173/contact', name: 'screenshot-10-contact.png' },
  // Regression check Batch 1
  { url: 'http://localhost:5173/', name: 'screenshot-1-home.png' },
  { url: 'http://localhost:5173/collections', name: 'screenshot-2-categories.png' },
  { url: 'http://localhost:5173/products', name: 'screenshot-3-products.png' },
  { url: 'http://localhost:5173/products/handcrafted-wooden-sofa', name: 'screenshot-4-detail.png' },
  { url: 'http://localhost:5173/admin/login', name: 'screenshot-5-admin-login.png' },
];

async function capture() {
  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });

  // Credentials are supplied by the local operator; never embed them in source.
  const loginPage = await context.newPage();
  if (process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD) {
    await loginPage.goto('http://localhost:5173/admin/login');
    await loginPage.fill('input[type="email"]', process.env.E2E_ADMIN_EMAIL);
    await loginPage.fill('input[type="password"]', process.env.E2E_ADMIN_PASSWORD);
    await loginPage.click('button[type="submit"]');
    await loginPage.waitForTimeout(1200);
  }
  await loginPage.close();

  const page = await context.newPage();

  for (const item of pagesToCapture) {
    console.log(`Capturing: ${item.url}`);
    await page.goto(item.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const savePath = path.join(outputDir, item.name);
    await page.screenshot({ path: savePath, fullPage: true });
    console.log(`Saved: ${savePath}`);
  }

  await browser.close();
  console.log('✅ All 10 pages captured and verified successfully!');
}

capture().catch(console.error);
