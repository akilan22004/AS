import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs/promises';

const outputDir = 'C:/Users/Welcome/.gemini/antigravity/brain/b4ef3eb8-df9b-4cfc-8ff1-80cdd9bb76fe/screenshots';

const batch3Pages = [
  { url: 'http://localhost:5173/craftsmanship', name: 'screenshot-11-craftsmanship.png' },
  { url: 'http://localhost:5173/showcase', name: 'screenshot-12-showcase.png' },
  { url: 'http://localhost:5173/featured-collections', name: 'screenshot-13-featured-collections.png' },
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

  for (const item of batch3Pages) {
    console.log(`Capturing: ${item.url}`);
    await page.goto(item.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const savePath = path.join(outputDir, item.name);
    await page.screenshot({ path: savePath, fullPage: true });
    console.log(`Saved: ${savePath}`);
  }

  await browser.close();
  console.log('✅ Batch 3 screenshots captured successfully!');
}

capture().catch(console.error);
