#!/usr/bin/env node
/**
 * Check a topic-book spec against the Noori template before any art or narration.
 *
 *   node .claude/skills/topic-book/scripts/check-spec.js <slug>
 *
 * ERRORS (exit 1) — the book would not follow the Noori pattern or would not build:
 *   - page types not exactly noori-shell's sequence (cover, title, about, 14 story,
 *     recap, the 11 exercise types in the same order, certificate, answers, practice, end)
 *   - 32 interior pages; exercise numbers 1..11; unique keys
 *   - missing ar / en / eg fields a page type needs (story: name line sound note; eg line + say)
 *   - answer arrays that do not fit their rows; KS.pic names that do not exist
 *   - a [[word]] the topic's ending regex does not colour (nothing would show)
 *   - "TODO" left anywhere
 * WARNINGS — read them:
 *   - Arabic words in ar.* with too few harakat (full tashkeel is the rule; the check is
 *     a heuristic, so a flagged word may be fine — look at it)
 *   - pictures with no gen line in source/gen-<slug>.sh
 * Then it lists every "proof" (†) item: the lines the teacher must check.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../../../..');
const BOOK = path.join(ROOT, 'book');
const slug = process.argv[2];
if (!slug) { console.error('usage: check-spec.js <slug>'); process.exit(1); }
const lib = require(path.join(BOOK, 'tools', 'lib.js'));
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const spec = read(path.join(BOOK, 'stories', `${slug}.json`));
const tpl = read(path.join(BOOK, 'stories', 'noori-shell.json'));
const T = lib.useTopic(spec);
const errs = [], warns = [], proofs = [];
const err = (m) => errs.push(m), warn = (m) => warns.push(m);

// 1. structure: the same pages as the Noori book, in the same order
const sig = (s) => s.pages.map((p) => p.type);
const want = sig(tpl), got = sig(spec);
if (want.join() !== got.join()) {
    err(`page types differ from noori-shell:\n      want ${want.join(' ')}\n      got  ${got.join(' ')}`);
}
const interior = lib.interiorPages(spec).length;
if (interior !== 32) err(`${interior} interior pages (the Noori pattern is exactly 32)`);
if (spec.slug !== slug) err(`spec.slug is "${spec.slug}", file is ${slug}.json`);
const keys = spec.pages.map((p) => p.key);
keys.filter((k, i) => keys.indexOf(k) !== i).forEach((k) => err(`duplicate key ${k}`));
const ex = spec.pages.filter(lib.isExercise).map((p) => p.exercise);
if (ex.join() !== '1,2,3,4,5,6,7,8,9,10,11') err(`exercise numbers ${ex.join(',')} (want 1..11)`);
['cover', 'title', 'about', 'recap', 'certificate', 'answers', 'practice', 'end'].forEach((k) => {
    if (!keys.includes(k)) err(`no page with key "${k}" (the tools look these up by key)`);
});

// 2. fields per page type
const need = {
    cover: { ar: ['eyebrow', 'title', 'line', 'say'], en: ['eyebrow', 'title', 'line'], eg: ['line', 'say'] },
    title: { ar: ['title', 'line', 'school', 'name'], en: ['title', 'line', 'school', 'name'] },
    about: { ar: ['name', 'body', 'scan'], en: ['name', 'body', 'scan'] },
    story: { ar: ['name', 'line', 'sound', 'note'], en: ['name', 'line', 'sound', 'note'], eg: ['line', 'say'] },
    recap: { ar: ['name', 'masc', 'fem', 'rule', 'fence', 'say'], en: ['name'], eg: ['say'] },
    certificate: { ar: ['name', 'line', 'who', 'date', 'say'], en: ['name', 'line'], eg: ['say'] },
    exercise: { ar: ['name', 'line', 'say'], en: ['name', 'line'], eg: ['say'] },
};
for (const p of spec.pages) {
    const n = need[lib.isExercise(p) ? 'exercise' : p.type];
    if (!n) continue;
    for (const lang of Object.keys(n)) for (const f of n[lang]) {
        if (!p[lang] || p[lang][f] == null || p[lang][f] === '') err(`${p.key}: no ${lang}.${f}`);
    }
    if (p.type === 'story' && !p.img) err(`${p.key}: story page with no img`);
}

// 3. exercises: shapes and answers
const picNames = (() => {
    const js = fs.readFileSync(path.join(ROOT, 'assets', 'kids.js'), 'utf8');
    const m = js.match(/var LABELS = \{([\s\S]*?)\};/);
    return new Set(m ? [...m[1].matchAll(/'([a-z-]+)':/g)].map((x) => x[1]) : []);
})();
for (const p of spec.pages.filter(lib.isExercise)) {
    const c = lib.choices(p);
    if (!Array.isArray(c) || c.length !== 2) err(`${p.key}: choices must be two words`);
    (p.items || []).forEach((it) => { if (it.pic && !picNames.has(it.pic)) err(`${p.key}: KS.pic "${it.pic}" does not exist (assets/kids.js LABELS)`); });
    if (p.type === 'circle' && (!p.answers || p.answers.length !== p.rows.length)) err(`${p.key}: answers must have one entry per row`);
    if (p.type === 'circle') p.rows.forEach((r, i) => { if (r[p.answers[i]] == null) err(`${p.key}: row ${i + 1} answer index out of range`); });
    if (p.type === 'addta') p.rows.forEach((r, i) => { if (r.length !== 3) err(`${p.key}: row ${i + 1} must be [word, stem, answer]`); });
    if (p.type === 'match' || p.type === 'fill') (p.items || p.rows).forEach((r, i) => { if (!['m', 'f'].includes(r.ans)) err(`${p.key}: item ${i + 1} ans must be "m" or "f"`); });
    if (p.type === 'adj') p.rows.forEach((r, i) => { if (r.opts[r.ans] == null) err(`${p.key}: row ${i + 1} ans out of range`); });
    if (p.type === 'trace' || p.type === 'addta' || p.type === 'fill' || p.type === 'adj') if (!p.pad) warn(`${p.key}: no "pad" (the web writing pad has no model words)`);
}

// 4. every string: TODO, [[word]] colouring, tashkeel
const HARAKA = /[ً-ْٰ]/g;
const LETTER = /[ء-ي]/g;
const walk = (v, where, fn) => {
    if (typeof v === 'string') fn(v, where);
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${where}[${i}]`, fn));
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, where ? `${where}.${k}` : k, fn));
};
const thin = new Map();
walk(spec, '', (s, where) => {
    if (/(^|\.)_/.test(where)) return;                       // _comment fields are notes, not words
    if (/\bTODO\b/.test(s)) err(`${where}: TODO left`);
    for (const m of s.matchAll(/\[\[([^\]]+)\]\]/g)) {
        if (!lib.taWord(m[1]).includes('class="ta"')) err(`${where}: [[${m[1]}]] — the topic ending (${T.ending}) does not match, nothing would be coloured`);
    }
    // full tashkeel: only the Fusha fields the child reads (ar.*, and exercise models)
    const fusha = /^pages\[\d+\]\.(ar\.(?!say)|rows|items|pad|start|write|choices|topic)/.test(where) || where.startsWith('topic.') && !/Re$|ending|lone/.test(where);
    if (!fusha) return;
    for (const w of s.replace(/\[\[|\]\]/g, '').split(/[\s،.:!؟«»()—…←/]+/)) {
        const letters = (w.match(LETTER) || []).length, harakat = (w.match(HARAKA) || []).length;
        if (letters >= 3 && harakat < Math.ceil(letters / 3) && !/^(نَوْرَس|سَان)$/.test(w)) {
            thin.set(w, (thin.get(w) || []).concat(where));
        }
    }
});
for (const [w, at] of thin) warn(`few harakat: «${w}» (${at.slice(0, 2).join(', ')}${at.length > 2 ? ' …' : ''})`);

// 5. pictures: one gen line per picture (+ back)
const genPath = path.join(BOOK, 'source', `gen-${slug}.sh`);
const imgs = [...new Set(spec.pages.filter((p) => p.img).map((p) => p.img).concat('back'))];
if (fs.existsSync(genPath)) {
    const g = fs.readFileSync(genPath, 'utf8');
    imgs.forEach((k) => { if (!new RegExp(`(^|\\s)gen\\s+${k}\\s+"`, 'm').test(g)) warn(`no gen line for picture "${k}" in source/gen-${slug}.sh`); });
} else warn(`no source/gen-${slug}.sh yet`);

// 6. proofreading items (†)
spec.pages.forEach((p) => (p.proof || []).forEach((x) => proofs.push(`${p.key}: ${x}`)));

const cfg = lib.bookConfig(slug);
console.log(`${slug}: ${spec.pages.length} pages (${interior} interior, ${ex.length} exercises, ${got.filter((t) => t === 'story').length} story), ${imgs.length} pictures`);
console.log(`  bookUrl ${cfg.bookUrl}${cfg.urlConfirmed ? '' : '  (not confirmed: print files will be -DRAFT)'}`);
console.log(`  audio   book/${cfg.audioDir}/{ar,eg}/<key>.mp3 · QR book/${cfg.qrDir}/`);
if (warns.length) { console.log(`\n${warns.length} warning(s):`); warns.forEach((w) => console.log('  - ' + w)); }
if (proofs.length) { console.log(`\n${proofs.length} line(s) for the teacher to proofread (†):`); proofs.forEach((w) => console.log('  ' + w)); }
if (errs.length) { console.log(`\n${errs.length} ERROR(S):`); errs.forEach((e) => console.log('  - ' + e)); process.exit(1); }
console.log('\nspec follows the Noori pattern');
