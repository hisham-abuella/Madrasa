// Social share cards: node assets/art/source/make-og.js  → assets/art/og/<theme>.jpg (1200×630)
// Renders og.html (generated scene + typeset wordmark) with Playwright (~/.kp-tools).
const { chromium } = require(process.env.HOME + '/.kp-tools/node_modules/playwright');
const path = require('path'), fs = require('fs');
const SRC = __dirname, OUT = path.join(__dirname, '..', 'og');
const THEMES = ['pacific', 'andalus', 'fanous', 'kurrasa', 'mosaic', 'mihrab'];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  for (const t of THEMES) {
    await p.goto('file://' + path.join(SRC, 'og.html') + '?theme=' + t, { waitUntil: 'networkidle' }).catch(() => {});
    await p.evaluate(() => document.fonts && document.fonts.ready);
    await p.waitForTimeout(600);
    const file = path.join(OUT, t + '.jpg');
    for (const q of [86, 80, 74, 68]) {
      await p.screenshot({ path: file, type: 'jpeg', quality: q });
      if (fs.statSync(file).size <= 150000) break;
    }
    console.log(t, Math.round(fs.statSync(file).size / 1024) + ' KB');
  }
  await b.close();
})();
