#!/usr/bin/env node
/* Render the cast sheet (S-052): assets/art/source/cast-sheet.html → cast-sheet.webp
   (screenshot, then Pillow WebP). Playwright from ~/.kp-tools.   node assets/art/source/make-cast.cjs */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { execFileSync } = require('child_process');
const { chromium } = require(path.join(os.homedir(), '.kp-tools', 'node_modules', 'playwright'));
(async () => {
  const dir = __dirname, png = path.join(dir, 'cast-sheet.png'), webp = path.join(dir, 'cast-sheet.webp');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1800, height: 1000 } });
  await p.goto('file://' + path.join(dir, 'cast-sheet.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(600);
  await (await p.$('.sheet')).screenshot({ path: png });
  await b.close();
  execFileSync('python3', ['-c', `from PIL import Image; Image.open(${JSON.stringify(png)}).convert('RGB').save(${JSON.stringify(webp)}, 'WEBP', quality=86, method=6)`]);
  fs.unlinkSync(png);
  console.log(path.relative(process.cwd(), webp), Math.round(fs.statSync(webp).size / 1024) + ' KB');
})();
