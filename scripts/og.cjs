// Generate share images (1200x630) into public/og/. Needs the dev server on :5173.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '../src/content/watches.ts'), 'utf8').split('export const PLATES')[0];
const watches = [...src.matchAll(/\n    id: '([^']+)',/g)].map((m) => m[1]);
const chapters = ['briefing', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8', 'ch9'];
(async () => {
  const out = path.join(__dirname, '../public/og');
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  for (const id of ['default', ...chapters, ...watches]) {
    await p.goto(`http://localhost:5173/dev/og.html?id=${id}`, { waitUntil: 'networkidle' });
    await p.waitForFunction(() => window.__ready === true, null, { timeout: 10000 });
    await p.screenshot({ path: path.join(out, `og-${id}.jpg`), type: 'jpeg', quality: 86 });
  }
  await b.close();
  console.log('made', 1 + chapters.length + watches.length, 'images');
})();
