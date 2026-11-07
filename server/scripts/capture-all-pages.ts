import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs/promises';

const outputDir = 'C:/Users/Welcome/.gemini/antigravity/brain/b4ef3eb8-df9b-4cfc-8ff1-80cdd9bb76fe/screenshots';

const allPages = [
  { url: 'http://localhost:5173/', name: 'final-01-home.png' },
  { url: 'http://localhost:5173/collections', name: 'final-02-categories.png' },
  { url: 'http://localhost:5173/products', name: 'final-03-products.png' },
  { url: 'http://localhost:5173/products/classic-wooden-sofa', name: 'final-04-detail.png' },
  { url: 'http://localhost:5173/collections/beds', name: 'final-05-beds.png' },
  { url: 'http://localhost:5173/featured-collections', name: 'final-06-featured.png' },
  { url: 'http://localhost:5173/craftsmanship', name: 'final-07-craftsmanship.png' },
  { url: 'http://localhost:5173/showcase', name: 'final-08-showcase.png' },
  { url: 'http://localhost:5173/about', name: 'final-09-about.png' },
  { url: 'http://localhost:5173/contact', name: 'final-10-contact.png' },
  { url: 'http://localhost:5173/admin/login', name: 'final-11-admin-login.png' },
  { url: 'http://localhost:5173/admin/add-product', name: 'final-12-admin-add.png' },
  { url: 'http://localhost:5173/admin/media', name: 'final-13-admin-media.png' },
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

  for (const item of allPages) {
    try {
      console.log(`Capturing: ${item.url}`);
      await page.goto(item.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(800);
      const savePath = path.join(outputDir, item.name);
      await page.screenshot({ path: savePath, fullPage: true });
      console.log(`Saved: ${item.name}`);
    } catch (e: any) {
      console.error(`Error on ${item.url}:`, e.message);
    }
  }

  await browser.close();
  console.log('✅ All screenshots captured successfully!');
}

capture().catch(console.error);
