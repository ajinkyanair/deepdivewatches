// Usage: node scripts/shot.mjs <url> <out.png> [width] [height] [scrollY|#hash] [fullPage]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [url, out, w = '1440', h = '900', pos = '0', full = ''] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[console]', m.type(), m.text()); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
if (pos.startsWith('#')) { await page.evaluate((d) => window.__ddw?.jump?.(d, false), pos.slice(1)); }
else if (+pos) { await page.evaluate((y) => window.scrollTo(0, y), +pos); }
await page.waitForTimeout(1200);
await page.screenshot({ path: out, fullPage: !!full });
await browser.close();
