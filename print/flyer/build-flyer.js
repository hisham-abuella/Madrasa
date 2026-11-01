#!/usr/bin/env node
/* A5 masjid flyer (S-054) -> flyer-a5.html + nawras-flyer-a5.pdf
 *
 *   uvx --with segno python print/flyer/make-flyer-qr.py   # once, or when the URL changes
 *   node print/flyer/build-flyer.js                         # HTML + PDF (Playwright from ~/.kp-tools)
 *
 * A5 portrait 148 x 210 mm, no bleed: made for home/office printers (which cannot print to the
 * edge anyway), so the frame sits 5 mm inside the sheet. A print shop job would need 3 mm bleed.
 * Ornament comes from book/tools/lib.js (DECO, decoDefs, decoFrame, decoPattern), read only.
 *
 * PLACEHOLDERS: every value below with ph:true prints a small "placeholder" tag. For the real
 * print, type the owners' confirmed value and set ph:false (or delete the ph line), rebuild,
 * and check the PDF: `grep -c placeholder flyer-a5.html` should then be 0.
 */
const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '..', '..');
const { DECO, decoDefs, decoFrame, decoPattern } = require(path.join(ROOT, 'book', 'tools', 'lib.js'));

const DATA = {
    schedule: { v: 'Saturdays 9:30 – 12:00<br>KG until 11:00', ph: true },
    ages:     { v: 'Ages 4 – 10', ph: false },
    free:     { v: 'First class free · parents welcome', ph: false },
    phone:    { v: '(619) 555-0142', ph: true },
    email:    { v: 'hello@nawras.example', ph: true },
};
const URL = 'https://hisham-abuella.github.io/Madrasa/parents.html';
const W = 148, H = 210, QR_MM = 34;   // QR incl. 4-module quiet zone: 37/45 x 34 = 27.96 mm symbol

const rel = (p) => path.relative(HERE, path.join(ROOT, p)).split(path.sep).join('/');
const tag = (d) => d.ph ? ' <span class="ph">placeholder</span>' : '';
const val = (d) => `<span class="v">${d.v}</span>${tag(d)}`;
const qr = fs.readFileSync(path.join(HERE, 'qr-parents.svg'), 'utf8');
const anyPh = Object.values(DATA).some((d) => d.ph);

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Nawras Fusha School — flyer (A5)</title>
<style>
  @font-face{font-family:"Noto Naskh Arabic";src:url("${rel('book/fonts/NotoNaskhArabic-400.ttf')}") format("truetype");font-weight:400}
  @font-face{font-family:"Noto Naskh Arabic";src:url("${rel('book/fonts/NotoNaskhArabic-700.ttf')}") format("truetype");font-weight:700}
  @font-face{font-family:"Baloo Bhaijaan 2";src:url("${rel('book/fonts/BalooBhaijaan2-400.ttf')}") format("truetype");font-weight:400}
  @font-face{font-family:"Baloo Bhaijaan 2";src:url("${rel('book/fonts/BalooBhaijaan2-700.ttf')}") format("truetype");font-weight:700}
  @page{size:148mm 210mm;margin:0}
  :root{--teal:${DECO.teal};--coral:${DECO.coral};--gold:${DECO.goldDeep};--paper:${DECO.paper};--sand:${DECO.sandSoft};
        --coral-text:#B8432A;--ink:#1B2B3A;--ink2:#41505E;--word:"Noto Naskh Arabic",serif;--ui:"Baloo Bhaijaan 2",sans-serif}
  html,body{margin:0;padding:0;background:#fff}
  body{font-family:var(--ui);color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .sheet{position:relative;width:${W}mm;height:${H}mm;overflow:hidden;background:var(--paper)}
  .sheet>svg{position:absolute;left:0;top:0}
  .in{position:absolute;inset:13mm 13mm 12mm 13mm;display:flex;flex-direction:column;align-items:center;text-align:center}
  .ar{font-family:var(--word);direction:rtl;letter-spacing:0}
  .head{display:flex;align-items:center;gap:4mm;direction:rtl}
  .head img{width:21mm;height:21mm}
  .head .ar{font-size:23pt;font-weight:700;line-height:1.5;color:var(--teal)}
  .head .en{font-size:12.5pt;font-weight:700;line-height:1.1;color:var(--ink2);direction:ltr}
  .tag{font-size:16pt;line-height:1.55;color:var(--coral-text);margin-top:1mm}
  .tag-en{font-size:11pt;color:var(--ink2);margin-top:-1mm}
  .hero{position:relative;width:100%;display:flex;align-items:center;justify-content:center;gap:2mm;margin:3mm 0 1mm}
  .hero img{width:50mm;height:50mm}
  .hero .say{max-width:62mm;text-align:left}
  .hero .say .ar{font-size:17pt;line-height:1.55;color:var(--teal);text-align:right;font-weight:700}
  .promise{font-size:13.5pt;line-height:1.3;margin-top:1mm}
  .promise b{color:var(--teal)}
  .facts{margin-top:5mm;width:100%;box-sizing:border-box;background:#fff;border:.4mm solid var(--teal);border-radius:4mm;padding:2.5mm 4mm}
  .facts .row{display:flex;align-items:baseline;gap:3mm;padding:1mm 0;border-bottom:.25mm dotted #9BBFC0}
  .facts .row:last-child{border-bottom:0}
  .facts .k{width:26mm;flex:none;text-align:right;font-family:var(--word);direction:rtl;font-size:13pt;font-weight:700;color:var(--teal);line-height:1.5}
  .facts .v{font-size:13.5pt;font-weight:700;line-height:1.25;text-align:left}
  .facts .row>div{flex:1;text-align:left}
  .ph{display:inline-block;font-family:var(--ui);font-size:7pt;font-weight:700;line-height:1;letter-spacing:.02em;text-transform:uppercase;
      color:#8A5A00;background:#FFF1C9;border:.25mm dashed #C98A00;border-radius:1.2mm;padding:.6mm 1.2mm .3mm;vertical-align:.4mm;white-space:nowrap}
  .foot{margin-top:auto;width:100%;display:flex;align-items:center;gap:4mm}
  .qr{width:${QR_MM}mm;height:${QR_MM}mm;flex:none;background:#fff}
  .qr svg{width:100%;height:100%;display:block}
  .foot .t{text-align:left;flex:1}
  .foot .ar{font-size:15pt;font-weight:700;line-height:1.55;color:var(--coral-text);text-align:left}
  .foot .cta{font-size:12.5pt;font-weight:700;line-height:1.2}
  .foot .url{font-size:8.5pt;color:var(--ink2);margin-top:1mm;word-break:break-all}
  .contact{margin-top:2mm;font-size:11pt;line-height:1.35}
  .note{margin-top:2.5mm;font-size:7.5pt;color:var(--ink2);text-align:center}
</style></head>
<body>${decoDefs()}
<section class="sheet" data-qr="${URL}">
  ${decoPattern(W, H, DECO.ink.page)}
  ${decoFrame(W, H, { l: 5, t: 5, r: 5, b: 5 }, 'band', { band: 5 })}
  <div class="in">
    <div class="head">
      <img src="${rel('logos/img/c1.webp')}" alt="">
      <div><div class="ar">مَدْرَسَةُ نَوْرَس لِلْفُصْحَى</div><div class="en">Nawras Fusha School, San Diego</div></div>
    </div>
    <div class="ar tag">نَتَعَلَّمُ الْفُصْحَى بِفَرَحٍ</div>
    <div class="tag-en">Fusha for little hearts, by the Pacific.</div>
    <div class="hero">
      <img src="${rel('assets/art/noori/wave.webp')}" alt="Noori the seagull waving">
      <div class="say"><div class="ar">السَّلَامُ عَلَيْكُمْ!<br>أَنَا نُورِي.</div>
        <div class="promise">Children use Arabic <b>from the first minute</b>: they point, act, choose, write and say it back.</div></div>
    </div>
    <div class="facts">
      <div class="row"><span class="k">الْأَعْمَارُ</span><div>${val(DATA.ages)}</div></div>
      <div class="row"><span class="k">الْمَوَاعِيدُ</span><div>${val(DATA.schedule)}</div></div>
      <div class="row"><span class="k">أَهْلًا وَسَهْلًا</span><div>${val(DATA.free)}</div></div>
    </div>
    <div class="foot">
      <div class="qr" data-qr="${URL}">${qr}</div>
      <div class="t">
        <div class="ar">اِحْجِزْ حِصَّةً تَجْرِيبِيَّةً</div>
        <div class="cta">Scan for parents: times, a Saturday at Nawras, and book a free trial class.</div>
        <div class="contact">${val(DATA.phone)}<br>${val(DATA.email)}</div>
        <div class="url">hisham-abuella.github.io/Madrasa/parents.html</div>
      </div>
    </div>
    ${anyPh ? '<div class="note">Details marked <span class="ph">placeholder</span> are waiting for the school to confirm them.</div>' : ''}
  </div>
</section>
</body></html>
`;
fs.writeFileSync(path.join(HERE, 'flyer-a5.html'), html);
console.log('wrote flyer-a5.html' + (anyPh ? ' (with placeholder tags)' : ''));

(async () => {
    const { chromium } = require(path.join(process.env.HOME, '.kp-tools', 'node_modules', 'playwright'));
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('file://' + path.join(HERE, 'flyer-a5.html'), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    // fail loudly if anything spills out of the inner safe box
    const over = await page.evaluate(() => {
        const box = document.querySelector('.in').getBoundingClientRect(), bad = [];
        document.querySelectorAll('.in *').forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.width && (r.left < box.left - .5 || r.right > box.right + .5 || r.top < box.top - .5 || r.bottom > box.bottom + .5)) bad.push(el.className || el.tagName);
        });
        return bad;
    });
    if (over.length) { console.error('OUTSIDE THE SAFE AREA:', [...new Set(over)].join(', ')); process.exitCode = 1; }
    await page.pdf({ path: path.join(HERE, 'nawras-flyer-a5.pdf'), preferCSSPageSize: true, printBackground: true });
    await browser.close();
    console.log('wrote nawras-flyer-a5.pdf');
})();
