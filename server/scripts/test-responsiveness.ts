/// <reference lib="dom" />
import { chromium } from 'playwright';

const viewports = [
  { name: '360px Android mobile', width: 360, height: 740 },
  { name: '390px iPhone', width: 390, height: 844 },
  { name: '430px Large mobile', width: 430, height: 932 },
  { name: '768px Tablet', width: 768, height: 1024 },
  { name: '1366px Desktop', width: 1366, height: 768 },
];

const routes = [
  '/',
  '/collections',
  '/collections/beds',
  '/products',
  '/about',
  '/contact',
  '/craftsmanship',
  '/showcase',
  '/admin/login',
];

async function testResponsiveness() {
  console.log('=== Multi-Viewport Responsiveness & Overflow Audit ===\n');
  const browser = await chromium.launch({ headless: true });
  let totalChecks = 0;
  let passedChecks = 0;

  for (const vp of viewports) {
    console.log(`\n📱 Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    for (const r of routes) {
      totalChecks++;
      await page.goto(`http://localhost:5173${r}`, { waitUntil: 'networkidle' });
      
      const metrics = await page.evaluate(() => ({
        windowWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        brokenImages: (Array.from(document.images) as HTMLImageElement[]).filter(img => img.complete && img.naturalWidth === 0).length,
      }));

      const hasOverflow = metrics.documentWidth > metrics.windowWidth + 1;
      const pass = !hasOverflow && metrics.brokenImages === 0;

      if (pass) {
        passedChecks++;
        console.log(`  ✅ ${r.padEnd(20)} | Width: ${metrics.windowWidth}px | Doc: ${metrics.documentWidth}px | Broken imgs: 0`);
      } else {
        console.log(`  ❌ ${r.padEnd(20)} | OVERFLOW: Window=${metrics.windowWidth}px Doc=${metrics.documentWidth}px | Broken imgs: ${metrics.brokenImages}`);
      }
    }
    await context.close();
  }

  await browser.close();
  console.log(`\n🎉 Viewport Audit Complete: ${passedChecks}/${totalChecks} checks passed!`);
}

testResponsiveness().catch(err => console.error('Viewport audit failed:', err));
