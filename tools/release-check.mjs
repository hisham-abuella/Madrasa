#!/usr/bin/env node
/* ============================================================================
   tools/release-check.mjs — one release sweep for «نَوْرَس» Nawras (not part of the site)
   ----------------------------------------------------------------------------
   Serves the repo at http://127.0.0.1:<port>/Madrasa/ (unknown paths → 404.html, status 404,
   like GitHub Pages), opens every page with Playwright (from ~/.kp-tools) and reports:

     err     console errors + page errors
     fail    failed requests + HTTP ≥ 400 (the deliberate deep-404 page itself excluded)
     img     broken images (complete, naturalWidth 0)
     hscr    sideways scroll (the page can be scrolled horizontally)
     cntr    RENDERED text contrast: each visible text run's colour (opacity applied) vs. the
             pixels actually painted behind its glyph boxes (viewport screenshots with all
             text made transparent, motion paused). Verdict = 10th-percentile ratio; < 4.5:1 (< 3:1 for large
             text, ≥ 24 px or ≥ 18.66 px bold) fails. "model" = the CSS-only estimate.
     lang    .en captions not in an English lang context + Arabic text not in an Arabic
             lang context (WCAG 3.1.2)
     loop    animations still running with infinite iterations after the page settles
             (warning only; .is-speaking etc. are not running at rest)
     rm      under prefers-reduced-motion: reduce, animations still running (must be 0)
     tap     visible links/buttons smaller than 44 px tall or wide (warning only; kid controls
             are designed at 56 px, parent links at ≥ 44 px)

   Configs: 1280×800 desktop, 820×1180 mobile, 390×844 mobile (touch); plus every theme
   (?theme=) and the simple-art mode (?art=svg) at 1280 for pages that take them.

   Usage (from the repo root):
     node tools/release-check.mjs                 full sweep
     node tools/release-check.mjs --quick         1280 + 390 only, no theme/art pass
     node tools/release-check.mjs --pages index.html,lessons/article.html
     node tools/release-check.mjs --verbose       list every failing element
     node tools/release-check.mjs --json out.json also write the raw results
   Exit code 1 when any hard check (err, fail, img, hscr, cntr, lang, rm) is non-zero.
   Debug: RC_DUMP=/some/dir/prefix writes the text-less tiles it sampled (<prefix>-<width>-<n>.png).
   ========================================================================= */
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(path.join(os.homedir(), '.kp-tools', 'package.json'));
const { chromium } = req('playwright');

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const opt = (f) => { const i = args.indexOf(f); return i > -1 ? args[i + 1] : null; };
const QUICK = flag('--quick'), VERBOSE = flag('--verbose');

const SKIP = new Set(['book/tools/story-template.html', 'pitch/build/_base.html', 'assets/art/source/og.html', 'assets/art/source/cast-sheet.html']);
// pages not yet in git (new in a fix round) are swept too
const NEW_PAGES = ['games/kids.html', 'games/sort.html', 'games/listen.html', 'games/build.html', 'lessons/story.html?kg=1'];
let pages = execFileSync('git', ['ls-files', '*.html'], { cwd: ROOT }).toString().trim().split('\n').filter((p) => p && !SKIP.has(p));
for (const p of NEW_PAGES) if (!pages.includes(p)) pages.push(p);
if (opt('--pages')) pages = opt('--pages').split(',');
if (!opt('--pages')) pages.push('no/such/deep/page.html');   // GitHub Pages 404 at depth
const DECKS = new Set(['lessons/presentation.html', 'pitch/index.html']);   // own themes, checked by check.mjs --themes
const THEMES = ['pacific', 'andalus', 'fanous', 'kurrasa', 'mosaic', 'mihrab'];

/* ── static server ─────────────────────────────────────────────────────── */
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jsonl': 'application/x-ndjson', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.txt': 'text/plain' };
const server = http.createServer((rq, rs) => {
  let u = decodeURIComponent(rq.url.split('?')[0]);
  if (!u.startsWith('/Madrasa/')) { rs.writeHead(404); rs.end('not under /Madrasa/'); return; }
  let f = path.join(ROOT, u.slice('/Madrasa/'.length));
  if (!f.startsWith(ROOT)) { rs.writeHead(403); rs.end(); return; }
  try { if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); } catch (e) {}
  fs.readFile(f, (e, buf) => {
    if (e) { rs.writeHead(404, { 'content-type': TYPES['.html'] }); rs.end(fs.readFileSync(path.join(ROOT, '404.html'))); return; }
    rs.writeHead(200, { 'content-type': TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    rs.end(buf);
  });
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/Madrasa/`;

/* ── in-page measurement ───────────────────────────────────────────────── */
function measure(textsOnly) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const cache = new Map();
  function rgba(c) {                                   // any CSS colour → [r,g,b,a] via the canvas
    if (cache.has(c)) return cache.get(c);
    cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data;
    const v = [d[0], d[1], d[2], d[3] / 255]; cache.set(c, v); return v;
  }
  const over = (top, bot) => { const a = top[3]; return [top[0] * a + bot[0] * (1 - a), top[1] * a + bot[1] * (1 - a), top[2] * a + bot[2] * (1 - a), 1]; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const COLRE = /(rgba?\([^)]*\)|color\([^)]*\)|ok(?:lab|lch)\([^)]*\)|lab\([^)]*\)|lch\([^)]*\)|#[0-9a-f]{3,8}\b)/gi;
  // the background candidates behind el: list of opaque colours (several for a gradient), or null if an image
  function backs(el) {
    const layers = []; let e = el;
    while (e && e.nodeType === 1) {
      const cs = getComputedStyle(e);
      const bi = cs.backgroundImage;
      if (bi && bi !== 'none') {
        if (/url\(/.test(bi)) return null;
        const stops = (bi.match(COLRE) || []).map(rgba);
        const bc = rgba(cs.backgroundColor);
        if (stops.length) {
          // each stop over the element's own colour, then the rest of the stack below
          const below = backs(e.parentElement) || [[255, 255, 255, 1]];
          const out = [];
          stops.forEach((s) => below.forEach((b) => { let c = over(s, over(bc, b)); for (let k = layers.length - 1; k >= 0; k--) c = over(layers[k], c); out.push(c); }));
          return out;
        }
      }
      const c = rgba(cs.backgroundColor);
      if (c[3] > 0) { layers.push(c); if (c[3] >= 0.999) break; }
      e = e.parentElement;
    }
    let c = [255, 255, 255, 1];
    for (let k = layers.length - 1; k >= 0; k--) c = over(layers[k], c);
    return [c];
  }
  function opac(el) { let o = 1, e = el; while (e && e.nodeType === 1) { o *= parseFloat(getComputedStyle(e).opacity); e = e.parentElement; } return o; }
  const vis = (el) => { const r = el.getBoundingClientRect(); if (r.width <= 1 || r.height <= 1) return false; return el.checkVisibility ? el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : true; };
  const name = (el) => { let s = el.tagName.toLowerCase(); if (el.id) s += '#' + el.id; if (el.className && typeof el.className === 'string') s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.'); return s; };
  const AR = /[؀-ۿ]/;

  // every visible text run: its colour (opacity applied) + its glyph boxes in page coordinates.
  // The background is measured later from a screenshot with all text made transparent.
  const texts = [];
  const all = document.body ? document.body.querySelectorAll('*') : [];
  if (textsOnly) {
  for (const el of all) {
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TITLE|OPTION|TEXTAREA)$/.test(el.tagName) || el.closest('svg')) continue;
    let txt = ''; const nodes = [];
    for (const n of el.childNodes) if (n.nodeType === 3 && n.nodeValue.trim()) { txt += n.nodeValue; nodes.push(n); }
    txt = txt.replace(/[\s\u200c\u200d]+/g, ' ').trim();
    if (!txt || !/[\p{L}\p{N}]/u.test(txt)) continue;
    if (!vis(el)) continue;
    if (el.closest('[disabled], [aria-disabled="true"], .sr-only, [data-contrast-skip], .ks-fab')) continue;
    const cs = getComputedStyle(el);
    let fg = rgba(cs.color);
    if (fg[3] === 0 || parseFloat(cs.fontSize) < 6) continue;
    fg = [fg[0], fg[1], fg[2], fg[3] * opac(el)];
    if (fg[3] < 0.05) continue;
    const fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight, 10) || 400;
    const need = (fs >= 24 || (fs >= 18.66 && fw >= 700)) ? 3 : 4.5;
    const rects = [];
    for (const n of nodes) {
      const rg = document.createRange(); rg.selectNodeContents(n);
      // the glyph band (≈ 1.2 em, centred), not the whole line box: leading reaches into outlines
      const band = Math.max(4, fs * 1.2);
      for (const r of rg.getClientRects()) if (r.width > 1 && r.height > 1) { const h = Math.min(r.height, band); rects.push([r.left + scrollX, r.top + scrollY + (r.height - h) / 2, r.width, h]); }
    }
    if (!rects.length) continue;
    texts.push({ el: name(el), text: txt.slice(0, 40), fg, need, rects: rects.slice(0, 12), model: +Math.min(...backs(el) ? backs(el).map((b) => ratio(over(fg, b), b)) : [99]).toFixed(2) });
  }

  return { texts };
  }

  // lang
  const langOf = (el) => { const l = el.closest('[lang]'); return l ? l.getAttribute('lang').toLowerCase() : ''; };
  const langEn = [], langAr = [];
  document.querySelectorAll('.en').forEach((el) => { if (vis(el) && !/^en/.test(langOf(el)) && /[A-Za-z]/.test(el.textContent)) langEn.push(name(el) + ' «' + el.textContent.trim().slice(0, 30) + '»'); });
  for (const el of all) {
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(el.tagName)) continue;
    let txt = ''; for (const n of el.childNodes) if (n.nodeType === 3) txt += n.nodeValue;
    if (AR.test(txt) && !/^ar/.test(langOf(el)) && vis(el)) langAr.push(name(el) + ' «' + txt.trim().slice(0, 30) + '»');
  }
  ['alt', 'aria-label'].forEach((a) => document.querySelectorAll('[' + a + ']').forEach((el) => {
    const v = el.getAttribute(a); if (AR.test(v) && !/^ar/.test(langOf(el)) && !/[A-Za-z]/.test(v)) langAr.push(name(el) + ' @' + a);
  }));

  // taps
  const tap = [];
  document.querySelectorAll('a[href], button, [role="button"], summary, input:not([type=hidden]), select').forEach((el) => {
    if (!vis(el) || el.closest('[aria-hidden="true"], .deck .slide:not(.active), svg')) return;
    const r = el.getBoundingClientRect();
    const af = getComputedStyle(el, '::after');      // .say--sm style hit areas
    let w = r.width, h = r.height;
    if (af && af.content !== 'none' && af.position === 'absolute') { const i = parseFloat(af.top) || 0; if (i < 0) { w -= 2 * i; h -= 2 * i; } }
    // links inside running prose (≥ 120 characters of sentence around them) are exempt (WCAG 2.5.8 inline exception)
    if (el.tagName === 'A' && getComputedStyle(el).display === 'inline' && el.parentElement && /^(P|LI)$/.test(el.parentElement.tagName) && !el.parentElement.classList.contains('files') && el.parentElement.textContent.trim().length > el.textContent.trim().length + 120) return;
    if (h < 43.5 || w < 43.5) tap.push(name(el) + ' ' + Math.round(w) + '×' + Math.round(h) + ' «' + (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24) + '»');
  });

  const anims = document.getAnimations ? document.getAnimations() : [];
  const loops = anims.filter((a) => a.playState === 'running' && a.effect && a.effect.getComputedTiming().iterations === Infinity)
    .map((a) => { const t = a.effect.target; return (t ? name(t) : '?') + ' ' + (a.animationName || ''); });
  const running = anims.filter((a) => a.playState === 'running').map((a) => { const t = a.effect && a.effect.target; return (t ? name(t) : '?') + ' ' + (a.animationName || a.constructor.name); });

  const imgs = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute('src') && i.loading !== 'lazy').map((i) => i.getAttribute('src'));
  const go = (x) => window.scrollTo({ left: x, top: window.scrollY, behavior: 'instant' });   // pages use scroll-behavior: smooth
  const sx0 = window.scrollX; go(100000); const sx1 = window.scrollX; go(-100000); const sx2 = window.scrollX; go(sx0);
  const hscroll = Math.max(Math.abs(sx1 - sx0), Math.abs(sx2 - sx0)) > 1 ? document.documentElement.scrollWidth + '>' + innerWidth : '';
  return { langEn, langAr, tap, loops, running, imgs, hscroll, theme: document.documentElement.getAttribute('data-theme') };
}

/* ── run ───────────────────────────────────────────────────────────────── */
const VIEWS = [
  { id: '1280', viewport: { width: 1280, height: 800 } },
  { id: '820m', viewport: { width: 820, height: 1180 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { id: '390m', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
].filter((v) => !QUICK || v.id !== '820m');

const browser = await chromium.launch();
// a blank page that decodes screenshots and samples the background pixels behind each text run
const sampler = await (await browser.newContext()).newPage();
await sampler.setContent('<canvas></canvas>');

// screenshots with every glyph transparent (and the floating buttons hidden): what is left behind
// each text box is the background a reader actually sees it on. Overlapping viewport tiles, not a
// full-page shot: a full-page capture resizes the viewport, so vh-sized blocks change height and
// everything below them moves. Fixed/sticky chrome is hidden after the first tile.
async function textlessTiles(page) {
  // SVG drawn with currentColor (badges, icons) is background, not text: pin its colour first.
  // (Keep the hiding rule to color + text-shadow: adding -webkit-text-fill-color or caret-color
  // made Chrome drop currentColor fills inside <use> — seen on the mosaic badges.)
  await page.evaluate(() => document.querySelectorAll('svg').forEach((v) => { v.setAttribute('data-rc-style', v.getAttribute('style') || ''); v.style.setProperty('color', getComputedStyle(v).color, 'important'); }));
  const h = await page.addStyleTag({ content: ':not(svg, svg *){color:transparent!important;text-shadow:none!important}.ks-fab,.ks-say-bubble{visibility:hidden!important}' });
  const { H, vh } = await page.evaluate(() => ({ H: Math.max(document.documentElement.scrollHeight, innerHeight), vh: innerHeight }));
  const step = Math.max(200, vh - 120), tiles = [];
  for (let y = 0; ; y += step) {
    const yy = Math.min(y, Math.max(0, H - vh));
    const real = await page.evaluate((t) => {
      window.scrollTo({ left: 0, top: t, behavior: 'instant' });
      if (window.scrollY > 0) document.querySelectorAll('body *').forEach((e) => { const p = getComputedStyle(e).position; if ((p === 'fixed' || p === 'sticky') && !e.hasAttribute('data-rc-hid')) { e.setAttribute('data-rc-hid', e.style.visibility || ' '); e.style.visibility = 'hidden'; } });
      return window.scrollY;
    }, yy);
    await page.waitForTimeout(40);
    tiles.push({ y: real, png: (await page.screenshot({ scale: 'css' })).toString('base64') });
    if (process.env.RC_DUMP) fs.writeFileSync(process.env.RC_DUMP + '-' + page.viewportSize().width + '-' + tiles.length + '.png', Buffer.from(tiles[tiles.length - 1].png, 'base64'));
    if (yy + vh >= H || tiles.length > 60) break;
  }
  await page.evaluate(() => { document.querySelectorAll('[data-rc-hid]').forEach((e) => { const v = e.getAttribute('data-rc-hid'); e.style.visibility = v.trim(); e.removeAttribute('data-rc-hid'); }); window.scrollTo({ left: 0, top: 0, behavior: 'instant' }); });
  await h.evaluate((n) => n.remove());
  await page.evaluate(() => document.querySelectorAll('svg[data-rc-style]').forEach((v) => { const o = v.getAttribute('data-rc-style'); if (o) v.setAttribute('style', o); else v.removeAttribute('style'); v.removeAttribute('data-rc-style'); }));
  return { tiles, vh };
}
// in the sampler page: for each text, the contrast of its colour against every background pixel
// in its glyph boxes; the 10th-percentile ratio is the verdict (thin rules/dots behind text don't
// decide it, a real low-contrast area does)
async function sample({ tiles, vh, texts }) {
  const cv = document.querySelector('canvas'), cx = cv.getContext('2d', { willReadFrequently: true });
  cv.__t = -1;                                               // the canvas is reused between pages
  const dec = [];
  async function tile(i) {                                   // decode a tile only when needed
    if (!dec[i]) { const img = new Image(); img.src = 'data:image/png;base64,' + tiles[i].png; await img.decode(); dec[i] = img; }
    if (cv.__t !== i) { cv.width = dec[i].width; cv.height = dec[i].height; cx.drawImage(dec[i], 0, 0); cv.__t = i; }
  }
  const lum = (r, g, b) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const fails = [], unknown = [];
  // sort texts by the tile they need so each tile is drawn once
  const pick = (y, h) => { let best = -1; for (let i = 0; i < tiles.length; i++) if (y >= tiles[i].y && y + h <= tiles[i].y + vh) { best = i; break; } return best; };
  const jobs = [];
  for (const t of texts) for (const r of t.rects) jobs.push({ t, r, i: pick(r[1], r[3]) });
  jobs.sort((a, b) => a.i - b.i);
  const acc = new Map();
  for (const j of jobs) {
    if (j.i < 0) continue;
    await tile(j.i);
    const [x, y, w, h] = j.r, ty = tiles[j.i].y;
    const x0 = Math.max(0, Math.floor(x)), y0 = Math.max(0, Math.floor(y - ty)), x1 = Math.min(cv.width, Math.ceil(x + w)), y1 = Math.min(cv.height, Math.ceil(y - ty + h));
    if (x1 - x0 < 1 || y1 - y0 < 1) continue;
    const d = cx.getImageData(x0, y0, x1 - x0, y1 - y0).data;
    const step = Math.max(1, Math.floor(Math.sqrt((x1 - x0) * (y1 - y0) / 400)));
    const rs = acc.get(j.t) || []; acc.set(j.t, rs);
    const a = j.t.fg[3];
    for (let yy = 0; yy < y1 - y0; yy += step) for (let xx = 0; xx < x1 - x0; xx += step) {
      const k = (yy * (x1 - x0) + xx) * 4, br = d[k], bg = d[k + 1], bb = d[k + 2];
      const L1 = lum(j.t.fg[0] * a + br * (1 - a), j.t.fg[1] * a + bg * (1 - a), j.t.fg[2] * a + bb * (1 - a)), L2 = lum(br, bg, bb);
      rs.push((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05));
    }
  }
  for (const t of texts) {
    const rs = acc.get(t);
    if (!rs || !rs.length) { unknown.push(t.el + ' «' + t.text + '» not on any tile'); continue; }
    rs.sort((a, b) => a - b);
    const p10 = rs[Math.floor(rs.length * 0.1)];
    if (p10 < t.need - 0.005) fails.push({ el: t.el, text: t.text, ratio: +p10.toFixed(2), need: t.need, model: t.model });
  }
  return { fails, unknown };
}
const rows = [];
async function run(pagePath, view, q, label, reduced, settle) {
  const ctx = await browser.newContext({ ...view, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  const errs = [], fails = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/the server responded with a status of 404/.test(m.text()) ) errs.push(m.text().slice(0, 160)); });
  page.on('pageerror', (e) => errs.push('pageerror: ' + String(e.message || e).slice(0, 160)));
  page.on('requestfailed', (r) => { const f = r.failure() && r.failure().errorText; if (!/ERR_ABORTED/.test(f || '') || !/\.(mp3|m4a)$/.test(r.url())) fails.push(r.url().replace(BASE, '') + ' ' + f); });
  page.on('response', (r) => { if (r.status() >= 400 && !(pagePath.startsWith('no/') && r.url().endsWith(pagePath))) fails.push(r.status() + ' ' + r.url().replace(BASE, '')); });
  const url = BASE + pagePath + (q ? (pagePath.includes('?') ? '&' : '?') + q : '');
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    // settle reveals + entrance animations, then let 3-iteration loops finish
    await page.evaluate(() => { document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in')); });
    // walk the page once so lazy images/iframes load (and don't move things later), then back to top
    await page.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += innerHeight) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 30)); } window.scrollTo({ top: 0, behavior: 'instant' }); });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(reduced ? 600 : settle || 1800);
  } catch (e) { errs.push('load: ' + e.message.slice(0, 120)); }
  let m = {};
  try {
    await page.evaluate(() => window.scrollTo({ left: 0, top: 0, behavior: 'instant' }));
    m = await page.evaluate(measure, false);
    // freeze motion, then measure text boxes and take the text-less screenshot in the same state
    const freeze = await page.addStyleTag({ content: '*,*::before,*::after{animation-play-state:paused!important;transition:none!important}' });
    await page.waitForTimeout(80);
    m.texts = (await page.evaluate(measure, true)).texts;
    const shot = await textlessTiles(page);
    await freeze.evaluate((n) => n.remove());
    const res = await sampler.evaluate(sample, { tiles: shot.tiles, vh: shot.vh, texts: m.texts || [] });
    m.contrast = res.fails; m.unknown = res.unknown;
  } catch (e) { errs.push('measure: ' + e.message.slice(0, 120)); }
  await ctx.close();
  const row = {
    page: pagePath, cfg: label, err: errs.length, fail: fails.length, img: (m.imgs || []).length, hscr: m.hscroll ? 1 : 0,
    cntr: (m.contrast || []).length, unk: (m.unknown || []).length, lang: (m.langEn || []).length + (m.langAr || []).length,
    loop: settle ? (m.loops || []).length : 0, rm: reduced ? (m.running || []).length : 0, tap: (m.tap || []).length,
    detail: { errs, fails, ...m, texts: undefined }
  };
  rows.push(row);
  const hard = row.err + row.fail + row.img + row.hscr + row.cntr + row.lang + row.rm;
  process.stdout.write((hard ? '✗ ' : '· ') + pagePath + ' [' + label + ']' + (hard ? '  err ' + row.err + ' fail ' + row.fail + ' img ' + row.img + ' hscr ' + row.hscr + ' cntr ' + row.cntr + ' lang ' + row.lang + ' rm ' + row.rm : '') + '\n');
  return row;
}

for (const p of pages) {
  for (const v of VIEWS) await run(p, v, '', v.id, false, v.id === '1280' ? 9000 : 0);   // 1280: wait out 3-iteration loops
  if (QUICK) continue;
  // pinned pages (data-theme-fixed + data-no-picker, e.g. the web book) never take another theme
  const head = p.startsWith('no/') ? '' : (fs.readFileSync(path.join(ROOT, p.split('?')[0]), 'utf8').match(/<html[^>]*>/) || [''])[0];
  const pinned = /data-theme-fixed/.test(head) && /data-no-picker/.test(head);
  if (!DECKS.has(p) && !p.startsWith('no/')) {
    if (!pinned) for (const t of THEMES) await run(p, VIEWS[0], 'theme=' + t, '1280 ' + t);
    await run(p, VIEWS[0], 'art=svg', '1280 art=svg');
  }
  await run(p, VIEWS[VIEWS.length - 1], '', '390m reduced', true);
}
await browser.close();
server.close();

/* ── report ────────────────────────────────────────────────────────────── */
const COLS = ['err', 'fail', 'img', 'hscr', 'cntr', 'lang', 'rm', 'loop', 'tap', 'unk'];
const byPage = new Map();
for (const r of rows) {
  const a = byPage.get(r.page) || { page: r.page, runs: 0 }; a.runs++;
  for (const c of COLS) a[c] = c === 'tap' || c === 'unk' || c === 'loop' ? Math.max(a[c] || 0, r[c]) : (a[c] || 0) + r[c];
  byPage.set(r.page, a);
}
const pad = (s, n) => String(s).padEnd(n);
console.log('\n' + pad('page', 34) + pad('runs', 6) + COLS.map((c) => pad(c, 6)).join(''));
const tot = { runs: 0 };
for (const a of byPage.values()) {
  console.log(pad(a.page, 34) + pad(a.runs, 6) + COLS.map((c) => pad(a[c], 6)).join(''));
  tot.runs += a.runs; for (const c of COLS) tot[c] = (tot[c] || 0) + a[c];
}
console.log(pad('TOTAL', 34) + pad(tot.runs, 6) + COLS.map((c) => pad(tot[c], 6)).join(''));
console.log('hard checks: err fail img hscr cntr lang rm (summed over runs) · warnings: loop tap unk (worst run per page)');

const show = (r, k, lim) => { const v = r.detail[k]; if (v && v.length) console.log('    ' + k + ': ' + v.slice(0, lim).map((x) => typeof x === 'string' ? x : JSON.stringify(x)).join('\n           ')); };
let printed = 0;
for (const r of rows) {
  const hard = r.err + r.fail + r.img + r.hscr + r.cntr + r.lang + r.rm;
  if (!hard && !VERBOSE) continue;
  if (!VERBOSE && printed > 60) break;
  printed++;
  console.log('\n  ' + r.page + ' [' + r.cfg + ']');
  ['errs', 'fails', 'imgs', 'contrast', 'langEn', 'langAr'].forEach((k) => show(r, k, VERBOSE ? 99 : 6));
  if (r.rm) show(r, 'running', 6);
  if (r.hscr) console.log('    hscroll: ' + r.detail.hscroll);
  if (VERBOSE) ['loops', 'tap', 'unknown'].forEach((k) => show(r, k, 40));
}
if (opt('--json')) fs.writeFileSync(opt('--json'), JSON.stringify(rows, null, 1));
const hardTotal = ['err', 'fail', 'img', 'hscr', 'cntr', 'lang', 'rm'].reduce((s, c) => s + tot[c], 0);
console.log(hardTotal ? '\nRELEASE CHECK: ' + hardTotal + ' hard issues' : '\nRELEASE CHECK: all hard checks passed');
process.exit(hardTotal ? 1 : 0);
