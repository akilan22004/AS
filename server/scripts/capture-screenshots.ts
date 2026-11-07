import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs/promises';

const outputDir = 'C:/Users/Welcome/.gemini/antigravity/brain/b4ef3eb8-df9b-4cfc-8ff1-80cdd9bb76fe/screenshots';

const pagesToCapture = [
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

  const page = await context.newPage();

  for (const item of pagesToCapture) {
    console.log(`Capturing: ${item.url}`);
    await page.goto(item.url, { waitUntil: 'networkidle' });
    // wait a moment for fonts/images to render
    await page.waitForTimeout(1000);
    const savePath = path.join(outputDir, item.name);
    await page.screenshot({ path: savePath, fullPage: true });
    console.log(`Saved: ${savePath}`);
  }

  await browser.close();
  console.log('✅ All 5 reference pages captured successfully!');
}

capture().catch(console.error);
