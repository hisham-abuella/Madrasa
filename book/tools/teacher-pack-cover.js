/* The teacher pack's cover sheet (S-053), US Letter, and the check manifest.
 *
 *   node tools/teacher-pack-cover.js <slug> <cover.pdf> <manifest.html>
 *
 * Called by tools/make-teacher-pack.sh. Writes:
 *   build/<slug>-teacher-pack-cover.html   the cover sheet (Naskh + Baloo from fonts/, white, thin lines)
 *   <cover.pdf>                            that sheet as a one-page Letter PDF (Playwright, ~/.kp-tools)
 *   <manifest.html>                        one <section class="sheet"> per page of the finished pack
 *                                          (cover + the worksheets' sections + the answers section,
 *                                          copied from the HTML the existing PDFs were printed from),
 *                                          so check-print-text.py and check-qr.py can check the pack
 *                                          page by page. It is not meant to be opened.
 * Words: the cover reuses the spec's titles and exercise names; Arabic is fully vocalised,
 * never letter-spaced, and has no colouring split (so no ZWJ needed).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib');
const { chromium } = require(path.join(process.env.HOME, '.kp-tools/node_modules/playwright'));

const [slug, coverPdf, manifestOut] = process.argv.slice(2);
if (!slug || !coverPdf || !manifestOut) { console.error('usage: teacher-pack-cover.js <slug> <cover.pdf> <manifest.html>'); process.exit(1); }
const ROOT = path.resolve(__dirname, '..');
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'stories', slug + '.json'), 'utf8'));
const config = L.bookConfig(slug);
const D = L.draft(config);
const esc = (s) => L.esc(L.plain(s));
const cover = spec.pages.find((p) => p.type === 'cover');
const exercises = spec.pages.filter(L.isExercise);
const answers = spec.pages.find((p) => p.type === 'answers');
const qrSvg = fs.readFileSync(path.join(ROOT, config.qrDir, 'qr-book.svg'), 'utf8');
const url = config.bookUrl;
const fileUrl = (rel) => 'file://' + path.join(ROOT, rel);
const logo = path.resolve(ROOT, '..', 'logos', 'img', 'c1.png');   // the hub logo, 1024px master

const rows = exercises.map((p, i) => `<tr><td class="n">${i + 2}</td><td class="ar" lang="ar" dir="rtl">${esc(p.ar.name)}</td>`
    + `<td class="en">${esc(String(p.en.name).replace(/^Exercise\s+/, ''))}</td></tr>`).join('\n');
const ansRow = answers ? `<tr class="ans"><td class="n">${exercises.length + 2}</td><td class="ar" lang="ar" dir="rtl">${esc(answers.ar.name)}</td>`
    + `<td class="en">Answers page (for parents; the teacher’s key)</td></tr>` : '';

const sheet = `<section class="sheet packcover" data-key="pack" data-qr="${L.esc(url)}">
  <header class="top">
    <img class="logo" src="file://${logo}" alt="">
    <div class="school"><p class="line ar-school" lang="ar" dir="rtl">مَدْرَسَةُ نَوْرَس لِلْفُصْحَى</p><p class="en small">Nawras Fusha School, San Diego</p></div>
  </header>
  <p class="eyebrow" lang="ar" dir="rtl">حَقِيبَةُ الْمُعَلِّمِ</p>
  <h1 class="line" lang="ar" dir="rtl">${esc(cover.ar.title)}</h1>
  <p class="en sub">${esc(cover.en.title)} · Teacher pack (US Letter, ${exercises.length + 2} pages)</p>
  <div class="cols">
    <div class="inside">
      <h2><span lang="ar" dir="rtl">مَا فِي الْحَقِيبَةِ</span> <span class="en">· What’s inside</span></h2>
      <table><tbody>
        <tr><td class="n">1</td><td class="ar" lang="ar" dir="rtl">هَذِهِ الصَّفْحَةُ</td><td class="en">This cover sheet and the QR code</td></tr>
${rows}
${ansRow}
      </tbody></table>
    </div>
  </div>
  <div class="bottom">
    <div class="how">
      <h2 class="en">How to use it on Saturday</h2>
      <ol class="en">
        <li><b>Warm-up:</b> scan the code and play the web book on the class screen: the story read aloud in Fusha.</li>
        <li><b>Worksheets in order</b> (pages 2–${exercises.length + 1}), one at a time, in pencil: start at the green dot.</li>
        <li><b>Answers</b> (page ${exercises.length + 2}) are for the teacher: tracing and drawing have no single answer, so praise the effort.</li>
      </ol>
      <p class="en note">Print at <b>Actual size (100%)</b>, single-sided, so the writing lines stay 26 mm and every QR code scans.</p>
    </div>
    <figure class="qr">
      <div class="code">${qrSvg}</div>
      <figcaption><span class="line" lang="ar" dir="rtl">اِمْسَحْ لِتَفْتَحَ الْكِتَابَ</span><span class="en small">Scan to open the narrated web book</span></figcaption>
    </figure>
  </div>
  <p class="en url">${L.esc(url)}</p>
</section>`;

const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(cover.en.title)} — teacher pack${D}</title><style>
@font-face{font-family:"Noto Naskh Arabic";src:url("${fileUrl('fonts/NotoNaskhArabic-400.ttf')}") format("truetype");font-weight:400}
@font-face{font-family:"Noto Naskh Arabic";src:url("${fileUrl('fonts/NotoNaskhArabic-700.ttf')}") format("truetype");font-weight:700}
@font-face{font-family:"Baloo Bhaijaan 2";src:url("${fileUrl('fonts/BalooBhaijaan2-400.ttf')}") format("truetype");font-weight:400}
@font-face{font-family:"Baloo Bhaijaan 2";src:url("${fileUrl('fonts/BalooBhaijaan2-700.ttf')}") format("truetype");font-weight:700}
@page{size:8.5in 11in;margin:0}
:root{--teal:${L.DECO.teal};--coral:${L.DECO.coral};--sand:${L.DECO.sandSoft};--ink:#1F2A2E}
*{box-sizing:border-box;letter-spacing:normal}
html,body{margin:0;background:#fff;color:var(--ink)}
.sheet{width:8.5in;height:11in;padding:12mm 16mm 11mm;display:flex;flex-direction:column;gap:1.5mm;overflow:hidden;border:0;
  background:linear-gradient(var(--teal),var(--teal)) top/100% 3mm no-repeat,linear-gradient(var(--teal),var(--teal)) bottom/100% 3mm no-repeat,#fff}
[lang=ar]{font-family:"Noto Naskh Arabic",serif;letter-spacing:0}
.en{font-family:"Baloo Bhaijaan 2",sans-serif;direction:ltr;text-align:left}
.top{display:flex;align-items:center;gap:5mm;direction:rtl}
.logo{width:20mm;height:20mm;border-radius:50%}
.school p{margin:0}.ar-school{font-family:"Noto Naskh Arabic",serif;font-size:20pt;font-weight:700;color:var(--teal);line-height:1.4}
.small{font-size:12pt;color:#4A5A5E}
.eyebrow{margin:0 0 -2mm;font-size:18pt;color:var(--coral);font-weight:700;text-align:center}
h1{margin:0;font-family:"Noto Naskh Arabic",serif;font-size:30pt;line-height:1.45;color:var(--teal);text-align:center}
.sub{margin:0;font-size:15pt;text-align:center}
h2{margin:1mm 0 1mm;font-size:16pt;color:var(--teal)}h2 [lang=ar]{font-size:19pt}h2 .en{display:inline}
.inside h2{text-align:right}
table{width:100%;border-collapse:collapse}
td{border-bottom:0.3mm solid #D8E6E5;padding:0 2mm;vertical-align:middle}
td.n{width:10mm;text-align:center;font-family:"Baloo Bhaijaan 2",sans-serif;font-weight:700;color:var(--teal);font-size:14pt}
td.ar{font-size:16pt;line-height:1.22;text-align:right;white-space:nowrap}
td.en{font-size:13.5pt;line-height:1.25}
tr.ans td{background:var(--sand)}
.bottom{margin-top:auto;display:flex;gap:8mm;align-items:flex-end;direction:ltr}
.how{flex:1}.how h2{text-align:left}
ol{margin:0;padding-left:6mm;font-size:13.5pt;line-height:1.3}ol li{margin-bottom:1mm}
.note{margin:2mm 0 0;font-size:12pt;color:#4A5A5E}
.qr{margin:0;width:46mm;text-align:center;display:flex;flex-direction:column;align-items:center;gap:1mm}
.qr .code{width:36mm;height:36mm;background:#fff}.qr .code svg{width:100%;height:100%;display:block}
.qr figcaption{display:flex;flex-direction:column}.qr figcaption .line{font-size:16pt;line-height:1.5}.qr figcaption .en{text-align:center}
.url{margin:1mm 0 0;font-size:11pt;color:#4A5A5E;text-align:center;direction:ltr}
</style></head><body>
${sheet}
</body></html>`;

// the check manifest: one section per page of the finished pack, in order
function sections(file) {
    const doc = fs.readFileSync(path.join(ROOT, 'build', file), 'utf8');
    return doc.split(/(?=<section class="(?:sheet|spread))/).slice(1).map((s) => s.replace(/<\/body>[\s\S]*$/, ''));
}
const ws = sections(`${slug}-worksheets-letter${D}.html`);
const ans = sections(`${slug}-home-a5${D}.html`).filter((s) => /data-key="answers"/.test(s));
if (ws.length !== exercises.length) { console.error(`worksheets HTML has ${ws.length} sheets, spec has ${exercises.length} exercises`); process.exit(1); }
if (ans.length !== 1) { console.error(`expected one answers sheet in the A5 HTML, found ${ans.length}`); process.exit(1); }
fs.writeFileSync(manifestOut, `<!doctype html><!-- check manifest for ${slug}-teacher-pack-letter${D}.pdf (tools/teacher-pack-cover.js); not for viewing -->\n`
    + [sheet, ...ws, ...ans].join('\n') + '\n');

const coverHtml = path.join(ROOT, 'build', `${slug}-teacher-pack-cover${D}.html`);
fs.writeFileSync(coverHtml, html);

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 816, height: 1056 } });   // 8.5 x 11 in at 96 px/in
    await page.goto('file://' + coverHtml, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const over = await page.evaluate(() => {
        const s = document.querySelector('.sheet').getBoundingClientRect(), bad = [];
        document.querySelectorAll('.sheet *').forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.width && (r.right > s.right - 12 || r.left < s.left + 12 || r.bottom > s.bottom - 12 || r.top < s.top + 8)) bad.push(el.className || el.tagName);
        });
        return bad;
    });
    await page.pdf({ path: coverPdf, width: '8.5in', height: '11in', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
    await browser.close();
    if (over.length) { console.error('  OUTSIDE THE SAFE AREA (cover): ' + [...new Set(over)].join(', ')); process.exit(2); }
    console.log(`  cover ${path.relative(ROOT, coverPdf)} · manifest ${path.relative(ROOT, manifestOut)}`);
})();
