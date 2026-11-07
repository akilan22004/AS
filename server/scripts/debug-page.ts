import { chromium } from 'playwright';

async function check() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  console.log('Navigating to http://localhost:5173...');
  const resp = await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  console.log('Status:', resp?.status());
  console.log('Title:', await page.title());
  const body = await page.evaluate(() => document.body.innerText);
  console.log('Body length:', body.length);
  console.log('Body snippet:', body.slice(0, 200));

  await browser.close();
}

check().catch(console.error);
