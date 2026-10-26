// Re-takes the deck's page screenshots (pitch/img/*.png) from the current pages, illustrated artwork mode.
// Run by images.py (or: node pitch/build/shots.cjs). Needs Playwright in ~/.kp-tools.
const path = require('path');
const { chromium } = require(path.join(process.env.HOME, '.kp-tools/node_modules/playwright'));
const R = path.resolve(__dirname, '../..');
const IMG = path.join(R, 'pitch/img');
const url = (p, q = '') => 'file://' + path.join(R, p) + '?art=ill' + q;

async function ready(page) {
  await page.evaluate(async () => {
    document.documentElement.setAttribute('data-art', 'ill');
    await document.fonts.ready;
    // walk the page so lazy images and scroll reveals fire, then come back up
    for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
    document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('in', 'is-in', 'revealed'));
    await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
  });
  await page.waitForTimeout(900);
}

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { try { localStorage.setItem('nawras-art', 'ill'); } catch (e) {} });
  const page = await ctx.newPage();

  // 1. six looks montage: 2 × 3 grid of 1280×900 homepage tops at half size
  const looks = ['01-andalus', '02-pacific', '03-fanous', '04-kurrasa', '05-mosaic', '06-mihrab'];
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const k of looks) {
    await page.goto(url('mockups/' + k + '.html'));
    await ready(page);
    await page.screenshot({ path: path.join(IMG, '_look-' + k + '.png') });
  }

  // 2. article, full page
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(url('lessons/article.html'));
  await ready(page);
  await page.screenshot({ path: path.join(IMG, 'lesson-article.png'), fullPage: true });

  // 3. story, page 3 (Noori meets Sami and Salma)
  await page.goto(url('lessons/story.html'));
  await ready(page);
  for (let i = 0; i < 2; i++) { await page.click('#nextBtn'); await page.waitForTimeout(700); }
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(IMG, 'lesson-story.png') });

  // 4. writing pad: story page 11, a traced ة and a praised «انْتَهَيْتُ»
  for (let i = 0; i < 8; i++) { await page.click('#nextBtn'); await page.waitForTimeout(450); }
  await page.waitForTimeout(800);
  const cv = page.locator('.s.on .wp-ink').first();
  const bx = await cv.boundingBox();
  if (bx) {
    const y = bx.y + bx.height * 0.2, x0 = bx.x + bx.width - 60;
    await page.mouse.move(x0, y); await page.mouse.down();
    for (let t = 0; t <= 24; t++) await page.mouse.move(x0 - t * 6, y + Math.sin(t / 3) * 14);
    await page.mouse.up();
    await page.locator('.s.on .wp-done').first().click();
  }
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(IMG, 'writing-pad.png') });

  // 5. classroom slides: title slide at 1920×1080
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(url('lessons/presentation.html'));
  await ready(page);
  await page.evaluate(() => document.documentElement.classList.add('kp-clean'));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(IMG, 'lesson-slides.png') });

  // 6. owners' deck title slide (hub hero card + og image)
  await page.goto('file://' + path.join(R, 'pitch/index.html'));
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.documentElement.classList.add('kp-clean'));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(IMG, 'title.png') });

  await b.close();
})();
