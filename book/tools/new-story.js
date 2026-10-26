#!/usr/bin/env node
/**
 * Build the web book from its spec.  (Adapted from bedtime-stories/tools/new-story.js
 * + build-book.py: same idea — one HTML file, a page per spec entry, a clip per page —
 * but Arabic-first, with exercise pages and KS.writePad from ../../assets/kids.js.)
 *
 *   node tools/new-story.js stories/<slug>.json      ->  books/<slug>.html
 *
 * Always rebuild through tools/build-book.sh, which also rewrites the narration
 * scripts (source/<slug>-{ar,eg}.json) so the clips match the words.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, esc, mark, plain, webPages, isExercise, arNum, decoWebCss, useTopic, choices, bookConfig } = require('./lib');

const specPath = process.argv[2];
if (!specPath) { console.error('usage: new-story.js stories/<slug>.json'); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const slug = spec.slug;
const T = useTopic(spec);
const config = bookConfig(slug);
const IMG = (k) => `../images-${slug}/${k}.webp`;

const en = (s) => s ? `<p class="en-line" lang="en">${mark(s)}</p>` : '';
const egLine = (p) => (p.eg && p.eg.line) ? `<p class="eg-line" lang="ar-EG"><b>بِالْمِصْرِيِّ</b>${esc(p.eg.line)}</p>` : '';
const pad = (models, lines, lh) => `<div data-writepad data-model="${esc((models || []).join('|'))}" data-lines="${lines || (models || []).length || 1}"${lh ? ` data-line-height="${lh}"` : ''}></div>`;
const exHead = (p) => `<div class="ex-head"><span class="ex-num" aria-hidden="true">${arNum(p.exercise)}</span><h2 class="word">${mark(p.ar.name)}</h2></div>
  <p class="line" style="font-size:1.3rem">${mark(p.ar.line)}</p>${en(p.en.name)}${en(p.en.line)}`;
const scoreBox = '<div class="score" aria-live="polite"></div><p class="hint" role="status"></p>';
const HINT_GENDER = T.hint;
// a picture, or n copies of it side by side ("n": 2 on an item: the dual books)
const picSpan = (it, attrs) => it.n > 1 ? `<span class="pic-pair"${attrs || ''}>${Array.from({ length: it.n }, () => `<span data-pic="${it.pic}"></span>`).join('')}</span>`
    : `<span data-pic="${it.pic}"${attrs || ''}></span>`;

// the recap's two columns, in the topic's order (Noori: هَذِهِ on the right, then هَذَا)
function recapCols(p) {
    const a = p.ar, c = choices(p), heads = a.heads || c;
    const f = `<div class="recap-col fcol"><h3 class="f">${esc(heads[1])}</h3>${a.fem.map((w) => `<p>${mark(w)}</p>`).join('')}</div>`;
    const m = `<div class="recap-col mcol"><h3 class="m">${esc(heads[0])}</h3>${a.masc.map((w) => `<p>${mark(w)}</p>`).join('')}</div>`;
    return T.recapFirst === 'm' ? `${m}\n  ${f}` : `${f}\n  ${m}`;
}

function body(p) {
    const a = p.ar, e = p.en;
    switch (p.type) {
    case 'cover':
        return `<div class="stage"><img class="breathe" src="${IMG(p.img)}" alt="${esc(T.coverAlt)}"></div>
  <div class="words"><p class="eyebrow">${mark(a.eyebrow)}</p><h1 class="word">${mark(a.title)}</h1><div class="cover-rule"></div>
  <p class="line" style="font-size:1.15rem">${mark(a.line)}</p>${en(e.title)}${en(e.line)}${egLine(p)}</div>`;
    case 'about':
        return `<div class="about"><h2>${mark(a.name)}</h2>${a.body.map((x) => `<p>${mark(x)}</p>`).join('')}
  <div class="en-block" lang="en"><h3>${esc(e.name)}</h3>${e.body.map((x) => `<p>${mark(x)}</p>`).join('')}</div></div>`;
    case 'story':
        return `<div class="stage"><img class="breathe" src="${IMG(p.img)}" alt="${esc(plain(e.line))}">${p.big ? `<span class="big-ta" aria-hidden="true">${esc(p.big)}</span>` : ''}</div>
  <div class="words"><h2>${mark(a.name)}</h2><p class="line">${mark(a.line)}</p><p class="sound">${mark(a.sound)}</p>${en(e.line)}${egLine(p)}</div>`;
    case 'recap':
        return `<div class="words" style="max-width:none"><h2>${mark(a.name)}</h2>${en(e.name)}</div>
  <div class="recap-grid">${recapCols(p)}</div>
  <p class="rule-box">${mark(a.rule)}</p><p class="rule-box">${mark(a.fence)}</p>`;
    case 'trace':
        return `${exHead(p)}<div class="ex-body">${pad(p.pad, p.pad.length + 1)}</div>`;
    case 'write':
        return `${exHead(p)}<div class="ex-body"><div class="pics">${p.items.map((it) => `<div class="pic-card">${picSpan(it)}</div>`).join('')}</div>
  ${pad(p.pad, 2)}</div>`;
    case 'circle':
        return `${exHead(p)}<div class="ex-body"><div class="rows">${p.rows.map((r, i) => `<div class="row" data-group data-hint="${esc(HINT_GENDER)}">${r.map((w, j) =>
            `<button type="button" class="pick" data-ok="${p.answers[i] === j ? 1 : 0}">${mark(w)}</button>`).join('')}</div>`).join('')}</div>${scoreBox}</div>`;
    case 'addta':
        return `${exHead(p)}<div class="ex-body"><div class="rows">${p.rows.map((r) => `<div class="row" data-group data-hint="${esc(T.addHint)}">
    <span class="noun">${mark(r[0])}</span><span aria-hidden="true">←</span><span class="noun"><span class="slot">${esc(r[1])}…</span></span>
    <button type="button" class="pick" data-ok="1" data-fill="${esc(mark('[[' + r[2] + ']]'))}" aria-label="${esc(T.addAria)}"><span class="ta">${esc(T.addMark)}</span></button></div>`).join('')}</div>${scoreBox}
  ${pad(p.pad, 2)}</div>`;
    case 'match':
        return `${exHead(p)}<div class="ex-body"><div class="rows">${p.items.map((it) => `<div class="row" data-group data-hint="${esc(HINT_GENDER)}">
    ${picSpan(it, ' class="pic-slot" style="width:64px;height:64px"')}<span class="noun">${mark(it.word)}</span>
    <button type="button" class="pick" data-ok="${it.ans === 'm' ? 1 : 0}">${mark(choices(p)[0])}</button><button type="button" class="pick" data-ok="${it.ans === 'f' ? 1 : 0}">${mark(choices(p)[1])}</button></div>`).join('')}</div>${scoreBox}</div>`;
    case 'fill':
        return `${exHead(p)}<div class="ex-body"><div class="rows">${p.rows.map((r) => `<div class="row" data-group data-hint="${esc(HINT_GENDER)}">
    <span class="noun"><span class="slot">…</span> ${mark(r.word)}</span>
    <button type="button" class="pick" data-ok="${r.ans === 'm' ? 1 : 0}" data-fill="${esc(mark(choices(p)[0]))}">${mark(choices(p)[0])}</button><button type="button" class="pick" data-ok="${r.ans === 'f' ? 1 : 0}" data-fill="${esc(mark(choices(p)[1]))}">${mark(choices(p)[1])}</button></div>`).join('')}</div>${scoreBox}
  ${pad(p.pad, 2)}</div>`;
    case 'adj':
        return `${exHead(p)}<div class="ex-body"><div class="rows">${p.rows.map((r) => `<div class="row" data-group data-hint="${esc(T.adjHint)}">
    <span class="noun">${mark(r.noun)} <span class="slot">…</span></span>${r.opts.map((o, j) => `<button type="button" class="pick" data-ok="${r.ans === j ? 1 : 0}" data-fill="${esc(mark(o))}">${mark(o)}</button>`).join('')}</div>`).join('')}</div>${scoreBox}
  ${pad(p.pad, 2)}</div>`;
    case 'draw':
        return `${exHead(p)}<div class="ex-body">${pad([], 3, 120)}${pad([p.start], 1)}</div>`;
    case 'certificate':
        return `<div class="cert"><div class="gull-wrap" data-gull="cheer"></div><h2 class="word" style="margin:0;color:var(--accent-text)">${mark(a.name)}</h2>${en(e.name)}
  <p class="line">${mark(a.line)}</p>${en(e.line)}<label class="word" for="champName" style="font-size:1.3rem">${esc(a.who)} <span lang="en" style="font-family:var(--ui);font-size:.9rem">Name</span></label>
  <input id="champName" type="text" maxlength="24" autocomplete="off"></div>`;
    default:
        return `<div class="words"><h2>${mark(a.name || a.title)}</h2></div>`;
    }
}

const pages = webPages(spec).map((p) => {
    const noteAr = p.ar && p.ar.note, noteEn = p.en && p.en.note;
    return {
        key: p.key, type: p.type, exercise: isExercise(p) ? p.exercise : 0,
        title: plain((p.ar && (p.ar.name || p.ar.title)) || p.key),
        tint: p.tint || '', audio: p.audio !== false,
        html: body(p),
        note: noteAr || noteEn ? `${noteAr ? mark(noteAr) : ''}${noteEn ? `<span class="en-line" lang="en">${mark(noteEn)}</span>` : ''}` : '',
    };
});
const BOOK = JSON.stringify({ title: plain(spec.title), pages }, null, 1).replace(/<\/script/gi, '<\\/script');

let out = fs.readFileSync(path.join(__dirname, 'story-template.html'), 'utf8');
const fill = {
    TITLE: esc(plain(spec.title)), DESC: esc(spec.desc), OGDESC: esc(spec.ogdesc || spec.desc),
    ICON: encodeURIComponent(spec.icon), ACCENT: spec.accent, BOOK, SLUG: slug,
    DECO_TILE: decoWebCss().tile, DECO_ROSE: decoWebCss().rose, AUDIO: `../${config.audioDir}/`,
    // only books that use picture pairs get the pair rules, so older books build byte-for-byte as before
    EXTRA_CSS: spec.pages.some((p) => (p.items || []).some((it) => it.n > 1))
        ? '\n  .pic-pair{display:inline-flex;gap:4px;align-items:center}.pic-card .pic-pair svg{width:64px;height:64px}.pic-slot.pic-pair{width:auto!important}.pic-slot.pic-pair svg{width:44px;height:44px}' : '',
};
for (const [k, v] of Object.entries(fill)) out = out.split(`{{${k}}}`).join(v);
const left = out.match(/\{\{[A-Z_]+\}\}/g);
if (left) { console.error('unfilled placeholders:', left); process.exit(1); }
fs.mkdirSync(path.join(ROOT, 'books'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'books', `${slug}.html`), out);
console.log(`books/${slug}.html — ${pages.length} pages (${pages.filter((p) => p.exercise).length} exercises)`);
