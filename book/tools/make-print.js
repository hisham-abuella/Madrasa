#!/usr/bin/env node
/**
 * Build a print-ready HTML edition of the lesson book, for rendering to PDF.
 * (Adapted from bedtime-stories/tools/make-print.js: the same Lulu geometry —
 * 8.5in square trim, 0.125in bleed, 0.5in safety, no crop marks or folio marks in
 * the bleed, the front cover lifted out into its own back+spine+front spread, the
 * spine from Lulu's formula, the interior padded to a multiple of four — but it
 * reads the spec directly and lays out story AND exercise pages.)
 *
 *   node tools/make-print.js <slug> <out.html> --format lulu|cover|a5|letter|a4
 *
 *   lulu    interior: every page but the cover, 8.75in square sheets (trim + bleed)
 *   cover   one spread: back + spine + front, for Lulu's cover upload
 *   a5      home booklet: cover, every page, back; A5 portrait, no bleed, padded to x4
 *   letter  teacher worksheet: the exercise pages alone, US Letter portrait
 *   a4      the same on A4
 *
 * The page is finished in the browser by tools/print-pages.js (dotted tracing
 * words with start dots and arrows, KS.pic pictures from ../../assets/kids.js),
 * so Chrome is run with --virtual-time-budget (see print-book.sh).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, esc, mark, plain, loadSpec, interiorPages, isExercise, arNum, pageUrl, DECO, star8, decoDefs, decoPattern, decoFrame, topic, choices } = require('./lib');

const [, , slug, outPath] = process.argv;
const arg = (f, d) => { const i = process.argv.indexOf(f); return i > -1 ? process.argv[i + 1] : d; };
if (!slug || !outPath) { console.error('usage: make-print.js <slug> <out.html> --format lulu|cover|a5|letter|a4'); process.exit(1); }
const format = arg('--format', 'lulu');
const { spec, config } = loadSpec(slug);
const T = topic();

const IN = 25.4;
const lulu = format === 'lulu' || format === 'cover';
const trim = 8.5 * IN;                    // Lulu Square 8.5in
const bleed = lulu ? 0.125 * IN : 0;      // trimmed off; artwork and tints run into it
const safe = lulu ? 0.5 * IN : 0;         // Lulu's safety margin: words this far inside the trim
const sheetW = { lulu: trim + bleed * 2, a5: 148, letter: 8.5 * IN, a4: 210 }[format] || 0;
const sheetH = { lulu: trim + bleed * 2, a5: 210, letter: 11 * IN, a4: 297 }[format] || 0;
const margin = { lulu: bleed + safe, a5: 10, letter: 15, a4: 15 }[format] || 0;

const outDir = path.dirname(path.resolve(outPath));
const rel = (p) => path.relative(outDir, path.join(ROOT, p));
const assets = path.relative(outDir, path.join(ROOT, '..', 'assets'));
const qrSvg = (name) => {
    const f = path.join(ROOT, config.qrDir, `${name}.svg`);
    if (!fs.existsSync(f)) { console.error(`no ${f} — run tools/make-qr.py`); process.exit(1); }
    return fs.readFileSync(f, 'utf8');
};
// Pictures print from the 1536px masters as JPEGs (input/img-hi), never from the
// 1024px web copies: 1536px is 300ppi up to 130mm and stays under Lulu's 600ppi
// ceiling down to 65mm, so every box below is sized inside that band.
function art(key, alt) {
    const hi = path.join('input', 'img-hi', `images-${slug}`, `${key}.jpg`);
    if (!fs.existsSync(path.join(ROOT, hi))) {
        if (process.env.PREVIEW) return `<div style="width:100%;height:100%;background:#E3ECEE;border-radius:4mm"></div>`;
        console.error(`no ${hi} — draw the 1536px master first`); process.exit(1);
    }
    return `<img src="${rel(hi)}" alt="${esc(alt || '')}">`;
}

// a picture card: one KS.pic, or n copies side by side ("n": 2 on an item: the dual books)
const pcard = (it) => it.n > 1 ? `<div class="pcard pair">${Array.from({ length: it.n }, () => `<span data-pic="${it.pic}"></span>`).join('')}</div>`
    : `<div class="pcard" data-pic="${it.pic}"></div>`;
const en = (s, cls) => s ? `<p class="en${cls ? ' ' + cls : ''}" lang="en">${mark(s)}</p>` : '';
const folio = (n) => (n && format !== 'letter' && format !== 'a4') ? `<p class="folio">${arNum(n)}</p>` : '';
// data-qr carries the exact URL the code must decode to; check-qr.py reads it back.
// The code is 32mm with its 4-module quiet zone, so the symbol itself is 26.7mm (version 6).
const qrUrl = (name) => name === 'qr-book' ? config.bookUrl : pageUrl(config, name.replace(/^qr-/, ''));
const qrBlock = (name, ar, enText, cls) => `<div class="qrbox ${cls || ''}" data-qr="${esc(qrUrl(name))}"><div class="qr">${qrSvg(name)}</div>
      <div class="qr-text"><b class="word">${esc(ar)}</b><span lang="en">${esc(enText)}</span></div></div>`;

/* ---- ornament: frame + background pattern (shapes and colours: lib.js -> DECO) ----
 * Sits behind .safe, between the trim (or the paper edge) and the safe area, so it
 * never touches words, writing lines or a QR quiet zone. Lulu: the frame's outer
 * line is 0.25in inside the trim and its inner edge stays outside the 0.5in safety.
 *   story, title, about, recap, answers, practice, end  thin line + very light pattern
 *   certificate, A5 cover/back                          the full zellige band + pattern
 *   exercise pages                                      corner rosettes only, white paper
 *   worksheets (Letter / A4)                            thin line frame only, white paper
 */
const worksheet = format === 'letter' || format === 'a4';
const fIn = { lulu: bleed + 0.25 * IN, a5: 4.5, letter: 7, a4: 7 }[format] || 0;     // outer line, from the sheet edge
const bandIn = { lulu: bleed + 5, a5: 4, letter: 6, a4: 6 }[format] || 0;
const bandW = { lulu: 5.5, a5: 4.4, letter: 6, a4: 6 }[format] || 5;
const ins = (v) => ({ l: v, t: v, r: v, b: v });
function deco(kind, ink) {
    const W = sheetW, H = sheetH;
    let out = '';
    if (ink && !worksheet) out += decoPattern(W, H, ink);
    if (kind === 'band') out += decoFrame(W, H, ins(bandIn), 'band', { band: bandW });
    else if (kind) out += decoFrame(W, H, ins(fIn), kind, format === 'a5' ? { rose: 2.1, radius: 4 } : {});
    return out ? `<div class="dz">${out}</div>` : '';
}
function decorate(html, p) {
    const t = p ? (isExercise(p) ? 'exercise' : p.type) : 'blank';
    let d = '';
    if (t === 'exercise' || t === 'practice') d = deco(worksheet ? 'line' : 'corner', 0);   // ruled lines: white paper
    else if (t === 'certificate') d = deco('band', DECO.ink.page);
    else if (t === 'story') d = deco('line', DECO.ink.story);
    else if (t !== 'blank') d = deco('line', DECO.ink.page);
    return d ? html.replace(/^(<section[^>]*>)/, `$1${d}`) : html;
}

/* ---- the exercise building blocks ------------------------------------------ */
// A ruled Arabic writing line: solid baseline, dotted mid-line, 26mm tall (8mm body) (the
// BRIEF asks for at least 12mm). With a model, the words are drawn dotted to
// trace (print-pages.js), starting from the right with a green dot and an arrow.
const ruled = (model, repeat, extra) => `<div class="rl${extra ? ' ' + extra : ''}"${model ? ` data-trace="${esc(model)}" data-repeat="${repeat || 1}"` : ''}><i class="mid"></i><i class="base"></i></div>`;
const exHead = (p) => `<header class="ex-head"><span class="ex-num">${arNum(p.exercise)}</span>
      <div><h2 class="word">${mark(p.ar.name)}</h2><p class="line inst">${mark(p.ar.line)}</p></div></header>
    <p class="en inst-en" lang="en"><b>${esc(p.en.name)}.</b> ${mark(p.en.line)}</p>`;
const exFoot = (p, n) => `<footer class="ex-foot">${qrBlock('qr-' + p.key, 'اكْتُبْ عَلَى الشَّاشَةِ', 'Scan to hear it and write on a tablet')}
      ${format === 'letter' || format === 'a4' ? `<p class="who word">الِاسْمُ: ……………………… <span lang="en">Name</span></p>` : ''}${folio(n)}</footer>`;

function exercise(p, n) {
    let mid = '';
    switch (p.type) {
    case 'trace':
        mid = p.rows.map((r) => r.blank ? Array.from({ length: r.blank }, () => ruled()).join('') : ruled(r.model, r.repeat)).join('');
        break;
    case 'write':
        mid = p.items.map((it) => `<div class="write-item">${pcard(it)}
        <div class="wl">${ruled(it.trace ? it.model : '', 1)}${it.trace ? '' : ''}</div></div>`).join('');
        break;
    case 'circle':
        mid = `<div class="circle-rows">${p.rows.map((r) => `<div class="circle-row">${r.map((w) => `<span class="cw word">${mark(w)}</span>`).join('')}</div>`).join('')}</div>`;
        break;
    case 'addta':
        mid = `<div class="addta-rows">${p.rows.map((r) => `<div class="addta-row word"><span class="from">${mark(r[0])}</span><span class="arrow" aria-hidden="true">←</span>
          <span class="to">${esc(r[1])}<span class="box" aria-label="${esc(T.addBoxAria)}"${p.boxMm ? ` style="width:${p.boxMm}mm"` : ''}></span></span></div>`).join('')}</div>`;
        break;
    case 'match': {
        const right = p.items.filter((_, i) => i % 2 === 0), left = p.items.filter((_, i) => i % 2 === 1);
        const col = (items, side) => `<div class="mcol ${side}">${items.map((it) => `<div class="mitem">${pcard(it)}
            <span class="word mword">${mark(it.word)}</span><i class="dot"></i></div>`).join('')}</div>`;
        mid = `<div class="match">${col(right, 'r')}<div class="mcol c"><div class="mtarget word"><i class="dot"></i>${mark(choices(p)[0])}<i class="dot"></i></div>
          <div class="mtarget word"><i class="dot"></i>${mark(choices(p)[1])}<i class="dot"></i></div></div>${col(left, 'l')}</div>`;
        break;
    }
    case 'fill':
        mid = `<div class="fill-rows">${p.rows.map((r) => `<div class="fill-row word"><span class="slotline">${ruled('', 1, 'short')}</span><span class="noun">${mark(r.word)}.</span></div>`).join('')}</div>
        <p class="fence word">${mark(p.fence || T.fillFence)}</p>`;
        break;
    case 'adj':
        mid = `<div class="adj-rows">${p.rows.map((r) => `<div class="adj-row word"><span class="noun">${mark(r.noun)}</span>
          ${r.opts.map((o) => `<span class="opt">${mark(o)}</span>`).join('<span class="or">/</span>')}</div>`).join('')}</div>
        <p class="copy-model word">${mark('اكْتُبْ: ' + p.write)}</p>${ruled()}`;
        break;
    case 'draw':
        mid = `<div class="draw-box"></div>${ruled(p.start, 1, 'start-only')}`;
        break;
    }
    return `<section class="sheet ex ${p.type}" data-key="${p.key}"><div class="safe">
    ${exHead(p)}<div class="ex-mid">${mid}</div>${exFoot(p, n)}</div></section>`;
}

/* ---- every page type ------------------------------------------------------- */
// the recap's two columns, in the topic's order (Noori: هَذِهِ on the right, then هَذَا)
function recapCols(p) {
    const a = p.ar, heads = a.heads || choices(p);
    const f = `<div class="rcol f"><h3 class="word">${mark(heads[1])}</h3>${a.fem.map((w) => `<p class="line">${mark(w)}</p>`).join('')}</div>`;
    const m = `<div class="rcol m"><h3 class="word">${mark(heads[0])}</h3>${a.masc.map((w) => `<p class="line">${mark(w)}</p>`).join('')}</div>`;
    return T.recapFirst === 'm' ? `${m}\n      ${f}` : `${f}\n      ${m}`;
}

function page(p, n) {
    const a = p.ar || {}, e = p.en || {};
    if (isExercise(p)) return exercise(p, n);
    switch (p.type) {
    case 'title':
        return `<section class="sheet title" data-key="title"><div class="safe">
    <div class="art t-art">${art('cover', 'Noori')}</div>
    <h1 class="word">${mark(a.title)}</h1>${en(e.title, 'big')}
    <p class="line">${mark(a.line)}</p>${en(e.line)}
    <p class="line school">${mark(a.school)}</p>
    <div class="owner"><p class="word">${mark(a.name)} <span lang="en">${esc(e.name)}</span></p>${ruled()}</div>${folio(n)}</div></section>`;
    case 'about':
        return `<section class="sheet about" data-key="about"><div class="safe">
    <h2 class="word">${mark(a.name)}</h2>${a.body.map((x) => `<p class="line ab">${mark(x)}</p>`).join('')}
    <div class="en-block" lang="en"><h3>${esc(e.name)}</h3>${e.body.map((x) => `<p class="line ab-en">${mark(x)}</p>`).join('')}</div>
    ${qrBlock('qr-book', a.scan, e.scan, 'about-qr')}${folio(n)}</div></section>`;
    case 'story':
        return `<section class="sheet story" data-key="${p.key}" style="--tint:${p.tint || "#FFFFFF"}"><div class="safe">
    <div class="art">${art(p.img, plain(e.line))}${p.big ? `<span class="big-ta">${esc(p.big)}</span>` : ''}</div>
    <div class="words"><h2 class="word">${mark(a.name)}</h2><p class="line">${mark(a.line)}</p><p class="sound">${mark(a.sound)}</p>${en(e.line)}</div>${folio(n)}</div></section>`;
    case 'recap':
        return `<section class="sheet recap" data-key="recap"><div class="safe">
    <h2 class="word center">${mark(a.name)}</h2>${en(e.note, 'center')}
    <div class="recap-grid">${recapCols(p)}</div>
    <p class="line rule">${mark(a.rule)}</p><p class="line rule">${mark(a.fence)}</p>${folio(n)}</div></section>`;
    case 'certificate':
        return `<section class="sheet cert" data-key="certificate"><div class="safe"><div class="frame">
    <div class="gull" data-gull="cheer"></div><h2 class="word">${mark(a.name)}</h2>${en(e.name)}
    <p class="line">${mark(a.line)}</p>${en(e.line)}
    <div class="stars">${Array.from({ length: 11 }, (_, i) => `<span class="star"><svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg><i>${arNum(i + 1)}</i></span>`).join('')}</div>
    ${en(e.note)}
    <div class="sign word"><span>${esc(a.who)} ……………………</span><span>${esc(a.date)} …………</span></div></div>${folio(n)}</div></section>`;
    case 'answers':
        return `<section class="sheet answers" data-key="answers"><div class="safe"><h2 class="word center">${mark(a.name)}</h2>${en(e.name, 'center')}
    <ol class="ans">${answers().join('')}</ol>${en(e.note)}${folio(n)}</div></section>`;
    case 'practice':
        return `<section class="sheet practice" data-key="practice"><div class="safe"><h2 class="word center">${mark(a.name)}</h2>
    <p class="line center">${mark(a.line)}</p>${en(e.line, 'center')}${Array.from({ length: 5 }, () => ruled()).join('')}${folio(n)}</div></section>`;
    case 'end':
        return `<section class="sheet end" data-key="end"><div class="safe">
    <div class="art e-art">${art('back', 'Noori waving goodbye')}</div>
    <h2 class="word center">${mark(a.name)}</h2><p class="line center">${mark(a.line)}</p>${en(e.line, 'center')}
    <p class="line center school">${mark(a.school)}</p>${en(e.credits, 'credits')}${folio(n)}</div></section>`;
    }
    return '';
}

// The answer key is read off the exercises themselves, so it cannot disagree with them.
function answers() {
    const ex = spec.pages.filter(isExercise);
    const strip = (w) => w.replace(/\[\[|\]\]/g, '');
    return ex.map((p) => {
        let ar = '', enx = '';
        switch (p.type) {
        case 'trace': case 'draw': ar = 'لَا إِجَابَةَ وَاحِدَةً: نَمْدَحُ الْمُحَاوَلَةَ.'; enx = 'No single answer — praise the effort.'; break;
        case 'write': ar = p.items.map((i) => i.model).join('، '); enx = 'Picture sentences'; break;
        case 'circle': ar = p.rows.map((r, i) => r[p.answers[i]]).map(strip).join('، '); enx = T.answersEn.circle; break;
        case 'addta': ar = p.rows.map((r) => r[2]).join('، '); enx = T.answersEn.addta; break;
        case 'match': { const [cm, cf] = choices(p).map(strip); ar = cm + ': ' + p.items.filter((i) => i.ans === 'm').map((i) => strip(i.word)).join('، ') + ' — ' + cf + ': ' + p.items.filter((i) => i.ans === 'f').map((i) => strip(i.word)).join('، '); enx = T.answersEn.match; break; }
        case 'fill': { const [cm, cf] = choices(p).map(strip); ar = p.rows.map((r) => (r.ans === 'm' ? cm + ' ' : cf + ' ') + strip(r.word)).join('، '); enx = T.answersEn.fill; break; }
        case 'adj': ar = p.rows.map((r) => strip(r.noun) + ' ' + strip(r.opts[r.ans])).join('، ') + '، ' + p.write; enx = T.answersEn.adj; break;
        }
        return `<li><b>${arNum(p.exercise)}</b> <span class="word">${esc(ar)}</span> <bdi dir="ltr" lang="en">(${esc(enx)})</bdi></li>`;
    });
}

/* ---- which pages go in which file ------------------------------------------ */
const sheets = [];
let padded = 0;
const cover = spec.pages.find((p) => p.type === 'cover');
const interior = interiorPages(spec);
// Lulu perfect binding needs 32 pages at least; the spec is written to exactly 32.
const pagesForSpine = Math.max(interior.length + ((4 - interior.length % 4) % 4), 32);
const spineIn = pagesForSpine / 444 + 0.06;            // Lulu: spine (in) = pages / 444 + 0.06
const spineMm = spineIn * IN;

function frontCover() {
    const c = cover.ar, ce = cover.en;
    return `<div class="art f-art">${art(cover.img, T.coverAltPrint)}</div>
      <div class="f-words"><p class="eyebrow word">${mark(c.eyebrow)}</p><h1 class="word">${mark(c.title)}</h1>
      ${en(ce.title, 'big')}<p class="line f-school">${mark(c.line)}</p></div>`;
}
// the Nawras badge (logos/svg/hilal-badge.svg, hand-made vector), inline so it prints as vector
const badge = () => fs.readFileSync(path.join(ROOT, '..', 'logos', 'svg', 'hilal-badge.svg'), 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '').replace('<svg ', '<svg class="badge" ')
    // Chrome rasterises SVG masks in a PDF: the crescent becomes a clipped even-odd path instead
    .replace(/<mask id="hm">[\s\S]*?<\/mask>/, '<clipPath id="hm"><circle cx="98" cy="110" r="80"/></clipPath>')
    .replace('<rect width="240" height="240" fill="#FFC94A" mask="url(#hm)"/>',
        '<path clip-path="url(#hm)" fill="#FFC94A" fill-rule="evenodd" d="M0 0H240V240H0Z M204 84A66 66 0 1 0 72 84A66 66 0 1 0 204 84Z"/>');
const chipStar = `<svg class="chip-star" viewBox="-1.1 -1.1 2.2 2.2" aria-hidden="true"><path d="${star8(1)}" fill="${DECO.gold}" stroke="${DECO.teal}" stroke-width=".12"/><circle r=".3" fill="${DECO.coral}"/></svg>`;
function backCover() {
    const c = cover.ar, ce = cover.en;
    const chip = (ar, enText) => `<li>${chipStar}<span class="word">${mark(ar)}</span><span class="chip-en" lang="en">${esc(enText)}</span></li>`;
    return `<div class="b-head"><h2 class="word">${mark(c.title)}</h2>${en(ce.title, 'big')}</div>
      <p class="line">${mark(T.backLine)}</p>
      ${en(T.backLineEn)}
      <div class="b-mid"><div class="art b-art">${art('back', 'Noori waving goodbye')}</div>
        <div class="b-side"><ul class="chips">${chip('قِصَّةٌ: ١٤ صَفْحَةً', 'Story · 14 pages')}${chip('تَمَارِينُ: ١١ صَفْحَةً', 'Writing practice · 11 pages')}${chip('شَهَادَةٌ وَإِجَابَاتٌ', 'Certificate + answers')}</ul>
        <div class="b-school">${badge()}<p class="word">${mark('مَدْرَسَةُ نَوْرَس لِلْفُصْحَى')}<span lang="en">Nawras Fusha School · San Diego</span></p></div></div></div>
      ${qrBlock('qr-book', 'امْسَحْ لِتَسْمَعَ الْقِصَّةَ', 'Scan to listen in Fusha or Egyptian Arabic', 'back-qr')}`;
}

if (format === 'cover') {
    // one ornament layer over the whole spread: the pattern runs on unbroken across
    // the spine (so a fold off by Lulu's 1/16in still looks right), a sand strip with
    // small stars marks the spine, and each cover gets its own zellige band
    const H = trim + bleed * 2, halfW = trim + bleed, sw = trim * 2 + spineMm + bleed * 2, fr = 0.25 * IN;
    const cx = halfW + spineMm / 2, strip = spineMm / 2 + 3;
    let spine = `<rect x="${(cx - strip).toFixed(3)}" y="0" width="${(strip * 2).toFixed(3)}" height="${H}" fill="${DECO.sandSoft}"/>`;
    for (let y = bleed + 9; y < H - bleed - 6; y += 9) {
        spine += (Math.round((y - bleed - 9) / 9) % 2 === 0)
            ? `<use href="#dz-bstar" transform="translate(${cx.toFixed(3)} ${y.toFixed(3)}) scale(1.15)"/>`
            : `<circle cx="${cx.toFixed(3)}" cy="${y.toFixed(3)}" r=".6" fill="${DECO.coral}"/>`;
    }
    const dz = `<div class="dz">${decoPattern(sw, H, DECO.ink.cover)}
      <svg class="dz-frame" viewBox="0 0 ${sw.toFixed(3)} ${H}" style="width:${sw.toFixed(3)}mm;height:${H}mm" aria-hidden="true">${spine}</svg>
      ${decoFrame(sw, H, { l: bleed + fr, t: bleed + fr, b: bleed + fr, r: sw - (halfW - fr) }, 'band', { band: 5.5 })}
      ${decoFrame(sw, H, { l: halfW + spineMm + fr, t: bleed + fr, b: bleed + fr, r: bleed + fr }, 'band', { band: 5.5 })}</div>`;
    sheets.push(`<section class="spread"><div class="half back"><div class="hsafe">${backCover()}</div></div>
    <div class="spine"></div><div class="half front"><div class="hsafe">${frontCover()}</div></div>${dz}</section>`);
} else if (format === 'lulu') {
    interior.forEach((p, i) => sheets.push(decorate(page(p, i + 1), p)));
    while (sheets.length % 4) { sheets.push('<section class="sheet blank"></section>'); padded++; }
} else if (format === 'a5') {
    sheets.push(`<section class="sheet a5cover">${deco('band', DECO.ink.cover)}<div class="safe">${frontCover()}</div></section>`);
    interior.forEach((p, i) => sheets.push(decorate(page(p, i + 1), p)));
    while ((sheets.length + 1) % 4) { sheets.push('<section class="sheet blank"></section>'); padded++; }
    sheets.push(`<section class="sheet a5back">${deco('band', DECO.ink.cover)}<div class="safe">${backCover()}</div></section>`);
} else {
    spec.pages.filter(isExercise).forEach((p) => sheets.push(decorate(page(p, 0), p)));
}

// picture pairs (dual books) only: older books build byte-for-byte as before
const pairCss = spec.pages.some((p) => (p.items || []).some((it) => it.n > 1))
    ? '\n  .pcard.pair{display:flex;gap:1mm;align-items:center}.pcard.pair span{flex:1;min-width:0;height:100%;display:flex;align-items:center}.pcard.pair svg{width:100%;height:auto}' : '';
/* ---- geometry and type ----------------------------------------------------- */
const spreadW = trim * 2 + spineMm + bleed * 2;
const pageRule = format === 'cover'
    ? `@page{size:${spreadW.toFixed(3)}mm ${sheetH || trim + bleed * 2}mm;margin:0}`
    : `@page{size:${sheetW}mm ${sheetH}mm;margin:0}`;
// A5 lays the square design out at 85% on a narrower page; English is set larger
// first so it still prints at 14pt after the scale.
const zoom = format === 'a5' ? 0.85 : 1;
const css = `
  ${pageRule}
  /* static instances of the variable fonts (fonts/*-400|700.ttf, fonttools varLib.instancer):
     Chrome embeds them as TrueType instead of Type 3 outlines, which print shops prefer */
  @font-face{font-family:"Noto Naskh Arabic";src:url("${rel('fonts/NotoNaskhArabic-400.ttf')}") format("truetype");font-weight:400}
  @font-face{font-family:"Noto Naskh Arabic";src:url("${rel('fonts/NotoNaskhArabic-700.ttf')}") format("truetype");font-weight:700}
  @font-face{font-family:"Baloo Bhaijaan 2";src:url("${rel('fonts/BalooBhaijaan2-400.ttf')}") format("truetype");font-weight:400}
  @font-face{font-family:"Baloo Bhaijaan 2";src:url("${rel('fonts/BalooBhaijaan2-700.ttf')}") format("truetype");font-weight:700}
  :root{--paper:#FFFDF7;--ink:#0B3540;--ink2:#3A6470;--acc:#0A6A72;--m:#12658C;--f:#B8391C;--ta-c:#C23B1E;
        --rule-c:#7FA6B0;--mid-c:#9DB8C0;--trace-c:#8FA9B0;--start:#2F9E44;
        --word:"Noto Naskh Arabic",serif;--ui:"Baloo Bhaijaan 2",sans-serif}
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;background:#fff;color:var(--ink);font-family:var(--ui)}
  body{font-size:14pt}
  .sheet{width:${sheetW}mm;height:${sheetH}mm;position:relative;overflow:hidden;page-break-after:always;break-after:page;background:#fff}
  .sheet:last-child{page-break-after:auto;break-after:auto}
  .safe{position:absolute;inset:${margin}mm;display:flex;flex-direction:column;align-items:stretch;
        ${zoom !== 1 ? `zoom:${zoom};inset:auto;top:${margin / zoom}mm;left:${margin / zoom}mm;width:${(sheetW - 2 * margin) / zoom}mm;height:${(sheetH - 2 * margin) / zoom}mm;` : ''}}
  .word,.line,.sound,h1,h2,h3{font-family:var(--word)}
  h1,h2,h3,p{margin:0}
  [dir],.safe{direction:rtl}
  .en{direction:ltr;unicode-bidi:isolate;font-family:var(--ui);font-size:${format === 'a5' ? 16.5 : 14}pt;line-height:1.35;color:var(--ink2);text-align:center}
  .en .word,.en span.m,.en span.f{font-family:var(--word)}
  .center{text-align:center}
  .m{color:var(--m);font-weight:700} .f{color:var(--f);font-weight:700} .ta{color:var(--ta-c)}
  .folio{position:absolute;bottom:0;left:0;right:0;text-align:center;font-family:var(--word);font-size:11pt;color:var(--ink2)}
  .art{display:flex;align-items:center;justify-content:center;flex:none;margin-inline:auto;position:relative}
  .art img{width:100%;height:100%;object-fit:cover;border-radius:4mm;display:block}

  /* story pages: a wash of the page's colour to the bleed, picture, words */
  .sheet.story{background:color-mix(in srgb,var(--tint) 22%,#FFFDF7)}
  .story .art{width:104mm;height:104mm}
  .story .words{display:flex;flex-direction:column;gap:1.5mm;text-align:center;margin-top:4mm}
  .story h2{font-size:30pt;line-height:1.45;color:var(--acc)}
  .story .line{font-size:21pt;line-height:1.72}
  .story .sound{font-size:19pt;line-height:1.6;font-weight:700;color:var(--acc)}
  .story .en{margin-top:1mm}
  .big-ta{position:absolute;top:3mm;right:3mm;font-family:var(--word);font-size:64pt;line-height:1.25;color:var(--ta-c);background:rgba(255,253,247,.92);border-radius:5mm;padding:0 5mm}

  /* title, about, recap, certificate, answers, end */
  .title .safe{align-items:center;justify-content:center;gap:4mm;text-align:center}
  .t-art{width:72mm;height:72mm}
  .title h1{font-size:34pt;line-height:1.45;color:var(--acc)}
  .title .en.big,.en.big{font-size:18pt;font-weight:700;color:var(--ink)}
  .title .line{font-size:18pt;line-height:1.6}
  .title .school{font-size:16pt;color:var(--ink2)}
  .owner{width:80%;margin-top:5mm;background:${DECO.paper};border-radius:4mm;padding:0 3mm}
  .owner p{font-size:16pt;text-align:start}
  .owner p span{font-family:var(--ui);font-size:14pt;color:var(--ink2)}
  .about h2{font-size:24pt;line-height:1.5;color:var(--acc);margin-bottom:1mm}
  .about .ab{font-size:15pt;line-height:1.62;margin-bottom:1mm}
  .about .en-block{direction:ltr;text-align:left;border-top:.3mm solid #CFE0E3;margin-top:2mm;padding-top:2mm}
  .about .en-block h3{font-family:var(--ui);font-size:15pt;margin-bottom:1mm}
  .about .ab-en{font-family:var(--ui);font-size:14pt;line-height:1.3;margin-bottom:1.2mm;color:var(--ink)}
  .about .ab-en .word,.about .ab-en span{font-family:var(--word)}
  .about-qr{margin-top:auto}
  .recap h2{font-size:34pt;color:var(--acc)}
  .recap-grid{display:grid;grid-template-columns:1fr 1fr;gap:6mm;margin:5mm 0}
  .rcol{border:.6mm solid;border-radius:5mm;padding:2mm 4mm;text-align:center}
  .rcol.f{border-color:#FF8A6B} .rcol.m{border-color:#3BA7D6}
  .rcol h3{font-size:30pt;line-height:1.5}
  .rcol .line{font-size:22pt;line-height:1.6}
  .recap .rule{font-size:19pt;line-height:1.6;text-align:center;background:#FFF1EA;border-radius:4mm;padding:1.5mm 4mm;margin-top:3mm}
  .cert .frame{flex:1;border:.5mm solid ${DECO.tealSoft};border-radius:6mm;padding:6mm;display:flex;flex-direction:column;align-items:center;gap:2.5mm;text-align:center}
  .cert .gull{width:44mm;height:44mm}
  .cert .gull svg{width:100%;height:100%}
  .cert h2{font-size:30pt;line-height:1.45;color:var(--acc)}
  .cert .line{font-size:19pt;line-height:1.6}
  .stars{display:flex;flex-wrap:wrap;justify-content:center;gap:2.5mm;max-width:150mm;margin-top:2mm}
  .star{position:relative;width:12mm;height:12mm}
  .star svg{width:100%;height:100%;fill:none;stroke:#B07F00;stroke-width:1.1}
  .star i{position:absolute;inset:0;display:grid;place-items:center;font-style:normal;font-family:var(--word);font-size:10pt;padding-top:1mm;color:#8A6400}
  .sign{display:flex;justify-content:space-between;width:100%;margin-top:auto;font-size:16pt}
  .answers h2{font-size:26pt;color:var(--acc)}
  .ans{list-style:none;padding:0;margin:4mm 0;display:flex;flex-direction:column;gap:2.2mm}
  .ans li{font-size:15pt;line-height:1.5}
  .ans li b{display:inline-grid;place-items:center;width:8mm;height:8mm;border-radius:50%;background:var(--acc);color:#fff;font-size:12pt;margin-inline-end:2mm;font-family:var(--word)}
  .ans li bdi{font-size:14pt;color:var(--ink2);direction:ltr;unicode-bidi:isolate}
  .practice h2{font-size:28pt;color:var(--acc)}
  .practice .line{font-size:18pt;margin-bottom:1mm}
  .practice .rl{margin-top:4mm}
  .end .safe{align-items:center;gap:3mm;text-align:center}
  .e-art{width:74mm;height:74mm}
  .end h2{font-size:32pt;color:var(--acc)}
  .end .line{font-size:20pt;line-height:1.6}
  .end .school{font-size:16pt;color:var(--ink2)}
  .credits{font-size:14pt;margin-top:auto;max-width:150mm}

  /* exercise pages: white, thin lines, room for pencil and crayon */
  .ex .safe{gap:3mm}
  .ex-head{display:flex;align-items:center;gap:4mm}
  .ex-num{flex:none;width:13mm;height:13mm;border-radius:50%;border:.7mm solid var(--acc);color:var(--acc);display:grid;place-items:center;font-family:var(--word);font-size:20pt;line-height:1}
  .ex-head h2{font-size:25pt;line-height:1.4;color:var(--acc)}
  .ex-head .inst{font-size:17pt;line-height:1.5}
  .inst-en{text-align:left;font-size:${format === 'a5' ? 16.5 : 14}pt}
  .ex-mid{flex:1;display:flex;flex-direction:column;justify-content:center;gap:3mm;min-height:0}
  .ex-foot{display:flex;align-items:flex-end;justify-content:space-between;gap:4mm;position:relative}
  .qrbox{display:flex;align-items:center;gap:3mm}
  .qr{width:32mm;height:32mm;flex:none;background:#fff}
  .qr svg{width:100%;height:100%;display:block}
  .qr-text{display:flex;flex-direction:column;gap:.5mm;max-width:60mm}
  .qr-text b{font-size:14pt;line-height:1.35}
  .qr-text span{font-family:var(--ui);font-size:11pt;direction:ltr;text-align:right;color:var(--ink2);line-height:1.25}
  .who{font-size:15pt}
  .who span{font-family:var(--ui);font-size:12pt}

  /* ruled Arabic writing line: 22mm, dotted mid-line, solid baseline */
  .rl{position:relative;height:26mm;flex:none;width:100%}
  .rl .base{position:absolute;left:0;right:0;top:18mm;border-top:.35mm solid var(--rule-c)}
  .rl .mid{position:absolute;left:0;right:0;top:10mm;border-top:.35mm dashed var(--mid-c)}
  .rl svg.trace{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
  .rl.short{width:52mm;height:18mm}
  .rl.short .base{top:13mm} .rl.short .mid{top:7mm}

  .write-item{display:flex;align-items:center;gap:5mm}
  .pcard{width:34mm;height:34mm;flex:none;border:.3mm solid #CFE0E3;border-radius:4mm;padding:2mm;background:#fff}
  .pcard svg{width:100%;height:100%}
  .wl{flex:1}
  .circle-rows,.addta-rows,.fill-rows,.adj-rows{display:flex;flex-direction:column;gap:2.5mm}
  .circle-row{display:flex;justify-content:space-around;align-items:center;height:20mm;border-bottom:.25mm dashed #D5E3E6}
  .cw{font-size:28pt;line-height:1.5;padding:0 8mm}
  .addta-row{display:flex;align-items:center;gap:6mm;justify-content:center;height:21mm;font-size:27pt}
  .addta-row .arrow{font-family:var(--ui);color:var(--ink2);font-size:20pt}
  .addta-row .to{display:inline-flex;align-items:center}
  .addta-row .box{display:inline-block;width:15mm;height:15mm;border:.45mm dashed var(--acc);border-radius:2.5mm;margin-inline-start:1mm}
  .addta-row .from{min-width:42mm;text-align:center}
  .match{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6mm;align-items:center}
  .mcol{display:flex;flex-direction:column;gap:5mm;align-items:center}
  .mitem{display:flex;flex-direction:column;align-items:center;position:relative}
  .mitem .pcard{width:28mm;height:28mm}
  .mword{font-size:19pt;line-height:1.4}
  .mitem .dot{position:absolute;top:13mm;width:3.2mm;height:3.2mm;border-radius:50%;background:var(--ink)}
  .mcol.r .dot{left:-5mm} .mcol.l .dot{right:-5mm}
  .mcol.c{gap:22mm}
  .mtarget{font-size:34pt;line-height:1.4;border:.5mm solid #CFE0E3;border-radius:5mm;padding:1mm 4mm;display:flex;align-items:center;gap:4mm}
  .mtarget .dot{width:3.2mm;height:3.2mm;border-radius:50%;background:var(--ink);flex:none}
  .fill-row{display:flex;align-items:flex-end;gap:4mm;justify-content:center;height:18mm;font-size:26pt}
  .fill-row .noun{line-height:1.3;padding-bottom:3mm;min-width:36mm}
  .fence{font-size:17pt;line-height:1.5;text-align:center;background:#FFF1EA;border-radius:4mm;padding:1mm 4mm}
  .adj-row{display:flex;align-items:center;gap:4mm;justify-content:center;height:17mm;font-size:24pt}
  .adj-row .noun{min-width:52mm}
  .adj-row .opt{padding:0 4mm}
  .adj-row .or{font-family:var(--ui);color:#A9BFC4}
  .copy-model{font-size:20pt;text-align:center;margin-top:2mm}
  .draw-box{flex:1;min-height:80mm;border:.5mm dashed var(--rule-c);border-radius:6mm}

  /* covers */
  .f-art{width:118mm;height:118mm}
  .f-words{text-align:center;display:flex;flex-direction:column;gap:2mm;margin-top:5mm}
  .f-words h1{font-size:36pt;line-height:1.45;color:var(--acc)}
  .eyebrow{font-size:17pt;color:var(--ink2)}
  .f-school{font-size:16pt;color:var(--ink2)}
  .a5cover .safe,.a5back .safe{justify-content:center;align-items:center}
  .back h2,.a5back h2{font-size:26pt;color:var(--acc);text-align:center}
  .back .line,.a5back .line{font-size:17pt;line-height:1.6;text-align:center}
  .b-art{width:66mm;height:66mm;margin:2mm}
  .back-qr{margin-top:auto;align-self:flex-start;direction:rtl}
  .school-en{text-align:center;margin-top:2mm}
  .sheet.blank{background:#fff}
  /* ornament layer (lib.js decoPattern / decoFrame): behind .safe, never clickable */
  .dz{position:absolute;inset:0;pointer-events:none}
  .dz svg{position:absolute;top:0;left:0;display:block;overflow:visible}
  .safe,.hsafe{z-index:1}
  /* covers: the title sits on a soft arch-topped paper panel so the pattern never
     runs under the letters; the pictures get a paper + teal ring */
  .f-words{background:${DECO.paper};border:.45mm solid ${DECO.tealSoft};border-radius:26mm 26mm 6mm 6mm / 14mm 14mm 6mm 6mm;padding:3mm 9mm 3.5mm}
  .f-art img,.b-art img{box-shadow:0 0 0 1.3mm ${DECO.paper},0 0 0 1.75mm ${DECO.teal}}
  .b-head{background:${DECO.paper};border:.45mm solid ${DECO.tealSoft};border-radius:22mm 22mm 5mm 5mm / 11mm 11mm 5mm 5mm;padding:1.5mm 10mm 2.5mm;text-align:center}
  .back .line,.a5back .line,.back .en,.a5back .en{background:color-mix(in srgb,${DECO.paper} 82%,transparent);border-radius:3mm;padding:0 2mm}
  .b-mid{display:flex;align-items:center;justify-content:center;gap:8mm;margin-top:1mm;direction:rtl}
  .chips{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2.5mm}
  .chips li{display:grid;grid-template-columns:7mm auto;column-gap:2.5mm;align-items:center;background:${DECO.paper};border:.4mm solid ${DECO.tealSoft};border-radius:4mm;padding:1.2mm 4mm 1.4mm 3mm}
  .chip-star{width:7mm;height:7mm;grid-row:1 / span 2}
  .chips .word{font-size:17pt;line-height:1.4;color:var(--ink)}
  .chip-en{font-family:var(--ui);font-size:12pt;color:var(--ink2);direction:ltr;text-align:right;line-height:1.2}
  .b-school{display:flex;align-items:center;gap:3mm;margin-top:3mm;background:${DECO.paper};border-radius:12mm;padding:1mm 5mm 1mm 1.5mm;border:.4mm solid ${DECO.tealSoft}}
  .b-school .badge{width:15mm;height:15mm;flex:none}
  .b-school p{font-size:15pt;line-height:1.35;color:var(--acc);display:flex;flex-direction:column}
  .b-school p span{font-family:var(--ui);font-size:11pt;color:var(--ink2);direction:ltr;text-align:right}
  .back-qr{background:#fff;border:.4mm solid ${DECO.tealSoft};border-radius:4mm;padding:1.5mm 4mm 1.5mm 1.5mm}
  .a5cover{background:linear-gradient(180deg,#DDF3F5 0%,#FFFDF7 55%)}
  .a5back{background:linear-gradient(180deg,#FFF4E8 0%,#FFFDF7 60%)}
  /* A5 lays everything out at 85%: the QR box grows so the printed symbol stays
     25mm+ (38mm x .85 = 32mm), and the answers page tightens to fit */
  .fmt-a5 .qr{width:38mm;height:38mm}
  .fmt-a5 .ans{gap:1.2mm;margin:2mm 0}
  .fmt-a5 .ans li{font-size:14.5pt;line-height:1.4}${pairCss}
${format === 'cover' ? `
  /* the spread: back | spine | front. Content keeps the full 0.5in safety from
     every trimmed edge and from the spine fold. Lulu's barcode area (92 x 32mm,
     bottom right of the back cover, 0.5in in) is left empty: the QR sits left. */
  .spread{width:${spreadW.toFixed(3)}mm;height:${trim + bleed * 2}mm;display:flex;overflow:hidden;background:#FFFDF7;direction:ltr;position:relative}
  /* Lulu binds on the left only (no right-to-left binding), so the flat spread is
     the usual back | spine | front even for an Arabic book; direction:ltr stops the
     page's rtl from flipping it */
  .half{flex:0 0 ${(trim + bleed).toFixed(3)}mm;position:relative}
  .half.front{background:linear-gradient(180deg,#DDF3F5 0%,#FFFDF7 55%)}
  .half.back{background:linear-gradient(180deg,#FFF4E8 0%,#FFFDF7 60%)}
  /* 3.4mm is too narrow for type (Lulu allows spine text from 80 pages), so the
     spine carries only the ornament strip drawn in the .dz layer: sand, wider than
     the spine itself and soft-edged, so Lulu's folding tolerance can't show an edge */
  .spine{flex:0 0 ${spineMm.toFixed(3)}mm;background:#FFFDF7}
  .hsafe{position:absolute;top:${bleed + safe}mm;bottom:${bleed + safe}mm;display:flex;flex-direction:column;align-items:center;gap:2mm;direction:rtl}
  .back .hsafe{left:${bleed + safe}mm;right:${safe}mm}
  .front .hsafe{left:${safe}mm;right:${bleed + safe}mm}
  .back .back-qr{align-self:flex-end}
` : ''}`;

fs.writeFileSync(outPath, `<!DOCTYPE html>
<html lang="ar" dir="rtl" data-theme="pacific" data-theme-fixed data-no-picker>
<head>
<meta charset="utf-8">
<title>${esc(plain(spec.title))} — ${format}</title>
<link rel="stylesheet" href="${assets}/kids.css">
<style>${css}</style>
</head>
<body class="fmt-${format}">
${decoDefs()}
${sheets.join('\n')}
<script src="${assets}/kids.js"></script>
<script src="${path.relative(outDir, path.join(__dirname, 'print-pages.js'))}"></script>
</body>
</html>
`);

console.log(`${path.basename(outPath)} — ${sheets.length} ${format === 'cover' ? 'spread' : 'sheets'}` +
    (format === 'cover' ? `, ${(spreadW / IN).toFixed(4)}in x ${((trim + bleed * 2) / IN).toFixed(3)}in (2 x 8.5in trim + ${spineIn.toFixed(4)}in spine for ${pagesForSpine} pages + 0.125in bleed)`
        : format === 'lulu' ? `, 8.5in square trim + 0.125in bleed, 0.5in safety${padded ? `, ${padded} blank(s) to reach a multiple of 4` : ''}`
            : `, ${format}${padded ? `, ${padded} blank(s)` : ''}`));
