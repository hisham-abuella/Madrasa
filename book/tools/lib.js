/**
 * Shared helpers for the Nawras lesson book tools (web build, print build,
 * transcripts). The spec is the only source of the words; these turn its light
 * markup into HTML for the eye or plain text for the voice.
 *
 *   [[word]]       colour the ة at the end of that word (ZWJ on both sides of
 *                  the split, BRIEF.md, so the letters stay joined)
 *   هَذَا / هَذِهِ   coloured automatically (masculine / feminine)
 *   a lone ة       coloured as the little shell
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ZWJ = '‍';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function taWord(w) {
    const m = w.match(/^(.*?)(ة[ً-ْٰ]*)(.*)$/);
    if (!m) return esc(w);
    if (!m[1]) return `<span class="ta">${esc(m[2])}</span>${esc(m[3])}`;
    return `${esc(m[1])}${ZWJ}<span class="ta">${ZWJ}${esc(m[2])}</span>${esc(m[3])}`;
}

/** spec string -> HTML for the page */
function mark(s) {
    if (s == null) return '';
    let out = '';
    String(s).split(/(\[\[[^\]]+\]\])/).forEach((part) => {
        if (/^\[\[.*\]\]$/.test(part)) { out += taWord(part.slice(2, -2)); return; }
        let h = esc(part)
            .replace(/هَذَا/g, '<span class="m">هَذَا</span>')
            .replace(/هَذِهِ/g, '<span class="f">هَذِهِ</span>')
            .replace(/(^|[\s«(:،])(ـ?ة)(?=[\s،.»):!؟]|$)/g, '$1<span class="ta">$2</span>');
        out += h;
    });
    return out;
}

/** spec string -> plain text (for narration, alt text, search) */
const plain = (s) => String(s || '').replace(/\[\[|\]\]/g, '').replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '').replace(/\s{2,}/g, ' ').trim();

function loadSpec(slug) {
    const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'stories', `${slug}.json`), 'utf8'));
    const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'book.config.json'), 'utf8'));
    return { spec, config };
}

/** pages that appear in the printed interior, in order (the cover is its own file) */
const interiorPages = (spec) => spec.pages.filter((p) => p.type !== 'cover');
/** pages that appear in the web book */
const webPages = (spec) => spec.pages.filter((p) => p.web !== false);
/** pages that are narrated */
const audioPages = (spec) => webPages(spec).filter((p) => p.audio !== false);
const isExercise = (p) => typeof p.exercise === 'number';

/** western digits -> Arabic-Indic */
const arNum = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);

/** the URL a page's QR code opens: the book, or the book at that page */
const pageUrl = (config, key) => key ? `${config.bookUrl}#${key}` : config.bookUrl;

/** print filenames carry -DRAFT until the hosting URL is confirmed */
const draft = (config) => (config.urlConfirmed ? '' : '-DRAFT');

module.exports = { ROOT, ZWJ, esc, mark, plain, taWord, loadSpec, interiorPages, webPages, audioPages, isExercise, arNum, pageUrl, draft };
