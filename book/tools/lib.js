/**
 * Shared helpers for the Nawras lesson book tools (web build, print build,
 * transcripts). The spec is the only source of the words; these turn its light
 * markup into HTML for the eye or plain text for the voice.
 *
 *   [[word]]       colour the ة at the end of that word (ZWJ on both sides of
 *                  the split, BRIEF.md, so the letters stay joined)
 *   هَذَا / هَذِهِ   coloured automatically (masculine / feminine)
 *   a lone ة       coloured as the little shell
 * (Those are the Noori defaults; a spec's "topic" block changes them — useTopic.)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ZWJ = '‍';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---- the topic: what the markup colours and what the exercises choose between ----
 * The Noori book (هَذَا / هَذِهِ, the ة) is the default. A new topic book puts a
 * "topic" block in its spec with only the fields that differ (see
 * .claude/skills/topic-book/SKILL.md). Two "sides" everywhere: m = the first
 * choice (blue, class "m"), f = the second (coral, class "f"); answers say "m" / "f".
 *
 *   auto      words coloured automatically everywhere: [word, "m"|"f"] (longest first is safe:
 *             one regex, so هَذَانِ is never split into هَذَا + نِ)
 *   ending    regex source of the coloured ending inside [[word]] (default the ة)
 *   last      true: colour the LAST match in the word (for endings like انِ that can repeat)
 *   lone      marks coloured when they stand alone in text («ة», «ـة»)
 *   choices   the two words the circle/match/fill/recap pages choose between [m, f];
 *             a page can override with its own "choices"
 */
const TOPIC_DEFAULT = {
    auto: [['هَذَا', 'm'], ['هَذِهِ', 'f']],
    ending: 'ة[ً-ْٰ]*', last: false,
    lone: ['ـة', 'ة'],
    choices: ['هَذَا', 'هَذِهِ'],
    recapFirst: 'f',
    hint: 'تَذَكَّرْ: ة فِي الْآخِرِ ← هَذِهِ. وَبِنْتٌ، أُمٌّ، شَمْسٌ مُؤَنَّثَةٌ بِلَا ة. — Look for the shell ة; and remember the fence words.',
    addMark: 'ة', addHint: 'ة — اضْغَطْ عَلَى الصَّدَفَةِ', addAria: 'أَضِفْ ة — add ة', addBoxAria: 'اكْتُبْ ة',
    adjHint: 'الصِّفَةُ مِثْلُ الِاسْمِ: هَذِهِ … ة — the describing word matches',
    fillFence: 'تَذَكَّرْ: بِنْتٌ، أُمٌّ، شَمْسٌ ← هَذِهِ (بِلَا ة)',
    answersEn: { circle: 'The feminine words (the last two have no ة)', addta: 'Add ة', match: 'Match', fill: 'هَذَا or هَذِهِ', adj: 'Adjective agreement' },
    coverAlt: 'نُورِي يَحْمِلُ صَدَفَةً صَغِيرَةً عَلَى الشَّاطِئِ — Noori holding a little shell on the beach',
    coverAltPrint: 'Noori holding a little shell',
    backLine: 'نُورِي، النَّوْرَسُ الصَّغِيرُ، يُعَلِّمُ: هَذَا لِلْمُذَكَّرِ، وَهَذِهِ لِلْمُؤَنَّثِ، وَالصَّدَفَةُ الصَّغِيرَةُ ة فِي آخِرِ الْكَلِمَةِ.',
    backLineEn: 'A Fusha lesson book for grade 1–2: a story in fourteen pages, then eleven pages of writing practice — tracing, circling, matching and drawing.',
};
let T = TOPIC_DEFAULT, RE = null;
const reEsc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** set the topic for mark() from a spec (call once per build; loadSpec does it) */
function useTopic(spec) {
    T = Object.assign({}, TOPIC_DEFAULT, (spec && spec.topic) || {});
    const auto = T.auto.slice().sort((a, b) => b[0].length - a[0].length);
    RE = {
        word: new RegExp(`^(${T.last ? '.*' : '.*?'})(${T.ending})(.*)$`),
        auto: new RegExp(auto.map((a) => reEsc(a[0])).join('|'), 'g'),
        cls: Object.fromEntries(auto),
        lone: new RegExp(`(^|[\\s«(:،])(${T.lone.map(reEsc).join('|')})(?=[\\s،.»):!؟]|$)`, 'g'),
    };
    return T;
}
const topic = () => T;
/** the two choices for a page: its own "choices", else the topic's */
const choices = (p) => (p && p.choices) || T.choices;
useTopic(null);

function taWord(w) {
    const m = w.match(RE.word);
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
            .replace(RE.auto, (w) => `<span class="${RE.cls[w]}">${w}</span>`)
            .replace(RE.lone, '$1<span class="ta">$2</span>');
        out += h;
    });
    return out;
}

/** spec string -> plain text (for narration, alt text, search) */
const plain = (s) => String(s || '').replace(/\[\[|\]\]/g, '').replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '').replace(/\s{2,}/g, ' ').trim();

/* ---- per-book config: book.config.json ----------------------------------------
 * The top level is the first book (noori-shell) and stays as it was. Other books
 * live under "books": { "<slug>": { bookUrl, urlConfirmed } }; a book with no
 * entry gets urlPattern with <slug> filled in and urlConfirmed false (-DRAFT).
 * audioDir / qrDir: noori-shell keeps audio/ and input/qr/ (top level); every
 * other book gets audio/<slug>/ and input/qr/<slug>/ so their files never collide.
 */
function bookConfig(slug) {
    const all = JSON.parse(fs.readFileSync(path.join(ROOT, 'book.config.json'), 'utf8'));
    const top = { slug: all.slug, bookUrl: all.bookUrl, urlConfirmed: all.urlConfirmed, audioDir: 'audio', qrDir: 'input/qr' };
    if (!slug || slug === all.slug) return top;
    const own = (all.books || {})[slug] || {};
    const pattern = all.urlPattern || 'https://hisham-abuella.github.io/Madrasa/book/books/<slug>.html';
    return Object.assign({ slug, bookUrl: pattern.replace('<slug>', slug), urlConfirmed: false,
        audioDir: `audio/${slug}`, qrDir: `input/qr/${slug}` }, own, { slug });
}

function loadSpec(slug) {
    const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'stories', `${slug}.json`), 'utf8'));
    useTopic(spec);
    return { spec, config: bookConfig(slug) };
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

/* ---- ornament: Pacific colours + Islamic geometry ----------------------------
 * Hand-made vector only (no generated pictures). One place for the colours and
 * the motifs, used by the print build (make-print.js: inline SVG, sized in mm)
 * and the web book (new-story.js: the same tile as a CSS data URI).
 *
 *   DECO.*            the palette (from assets/kids.css, theme "pacific")
 *   DECO.ink          how strong the background motifs print (group opacity).
 *                     0.10–0.16 reads as a watermark; above 0.2 it starts to compete
 *                     with the type. Exercise pages never get a pattern.
 *
 * Motifs: the 8-point star (khatam: two squares), a scallop shell, a small wave,
 * and a rosette (gold khatam with a coral heart) for the frame corners.
 * Everything is real vector paths and <use> copies (no SVG <pattern>, which
 * Chrome rasterises when it prints to PDF).
 */
const DECO = {
    teal: '#0B7A7E', tealSoft: '#A9D8D5', coral: '#FF7A5C', coralSoft: '#FFC9B8',
    gold: '#FFC94A', goldDeep: '#D99A1E', sand: '#F6DFB4', sandSoft: '#FBEFD8', paper: '#FFFDF7',
    ink: { story: 0.13, page: 0.11, cover: 0.15, web: 0.12 },
};
const f2 = (n) => +n.toFixed(3);
/** khatam (8-point star of two squares), centred on 0,0, outer radius R */
function star8(R, rot) {
    const pts = [];
    for (let k = 0; k < 16; k++) {
        const r = k % 2 ? R * 0.7654 : R, a = (k * 22.5 + (rot || 0) - 90) * Math.PI / 180;
        pts.push(`${f2(r * Math.cos(a))} ${f2(r * Math.sin(a))}`);
    }
    return 'M' + pts.join('L') + 'Z';
}
/** the shapes, at print size in mm (the web tile is the same numbers in px x 4) */
function decoShapes(id) {
    const d = DECO, T = 26;   // the background tile is 26mm square
    return `
  <g id="${id}-star"><path d="${star8(2.1)}" fill="none" stroke="${d.teal}" stroke-width=".42" stroke-linejoin="round"/><circle r=".55" fill="${d.teal}"/></g>
  <g id="${id}-shell" fill="none" stroke="${d.coral}" stroke-width=".42" stroke-linecap="round" stroke-linejoin="round">
    <path d="M0 1.9L-2.2 -.2A2.25 2.25 0 0 1 2.2 -.2Z"/><path d="M0 1.9L-1.15 -1.75M0 1.9L0 -2.05M0 1.9L1.15 -1.75"/><path d="M-.7 1.55L-1 2.25H1L.7 1.55"/></g>
  <path id="${id}-wave" d="M-3 0q1.5 -1.4 3 0t3 0" fill="none" stroke="${d.teal}" stroke-width=".42" stroke-linecap="round"/>
  <g id="${id}-spark"><path d="${star8(1.15, 22.5)}" fill="${d.goldDeep}"/></g>
  <g id="${id}-tile"><use href="#${id}-star" x="6.5" y="6.5"/><use href="#${id}-wave" x="19.5" y="6.8"/>
    <use href="#${id}-shell" x="19.5" y="19.3"/><use href="#${id}-spark" x="6.5" y="19.5"/></g>
  <g id="${id}-rose"><path d="${star8(1)}" fill="${d.gold}" stroke="${d.teal}" stroke-width=".09" stroke-linejoin="round"/>
    <path d="${star8(.6, 22.5)}" fill="${d.paper}" stroke="${d.coral}" stroke-width=".07" stroke-linejoin="round"/><circle r=".22" fill="${d.coral}"/></g>
  <g id="${id}-bstar"><path d="${star8(1)}" fill="${d.paper}" stroke="${d.teal}" stroke-width=".16" stroke-linejoin="round"/><circle r=".3" fill="${d.coral}"/></g>`
        .replace(/\n\s*/g, '') + `<!--tile ${T}mm-->`;
}
/** the hidden <svg> the print pages reference with <use> (once per document) */
const decoDefs = () => `<svg class="dz-defs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${decoShapes('dz')}</defs></svg>`;

/** a soft repeating background of stars, shells and waves, w x h mm */
function decoPattern(w, h, ink, opts) {
    const o = opts || {}, T = 26, ox = o.ox || 0, oy = o.oy || 0;
    let uses = '';
    for (let y = -T + (oy % T); y < h; y += T) {
        for (let x = -T + (ox % T); x < w; x += T) uses += `<use href="#dz-tile" x="${f2(x)}" y="${f2(y)}"/>`;
    }
    return `<svg class="dz-bg" viewBox="0 0 ${f2(w)} ${f2(h)}" style="width:${f2(w)}mm;height:${f2(h)}mm${o.style ? ';' + o.style : ''}" aria-hidden="true"><g opacity="${ink}">${uses}</g></svg>`;
}

/** rounded-rect path (x0,y0)-(x1,y1), corner radius r */
const rrect = (x0, y0, x1, y1, r) => `M${f2(x0 + r)} ${f2(y0)}H${f2(x1 - r)}A${r} ${r} 0 0 1 ${f2(x1)} ${f2(y0 + r)}V${f2(y1 - r)}A${r} ${r} 0 0 1 ${f2(x1 - r)} ${f2(y1)}H${f2(x0 + r)}A${r} ${r} 0 0 1 ${f2(x0)} ${f2(y1 - r)}V${f2(y0 + r)}A${r} ${r} 0 0 1 ${f2(x0 + r)} ${f2(y0)}Z`;

/**
 * A frame for a w x h mm sheet. inset = {l,t,r,b} mm from the sheet edge to the
 * frame's outer line.
 *   'band'    zellige band: sand band between two teal lines, a row of 8-point
 *             stars and coral dots, gold rosettes on the corners (covers, certificate)
 *   'line'    one thin teal line, a dotted gold line inside it, small rosettes (pages)
 *   'corner'  only small rosettes with two short arms each (exercise pages)
 */
function decoFrame(w, h, inset, kind, opts) {
    const o = opts || {}, d = DECO;
    const x0 = inset.l, y0 = inset.t, x1 = w - inset.r, y1 = h - inset.b;
    let g = '';
    if (kind === 'band') {
        const B = o.band || 5.5, R = o.radius || B * 1.2, ri = Math.max(R - B, 0.8);
        const cx0 = x0 + B / 2, cy0 = y0 + B / 2, cx1 = x1 - B / 2, cy1 = y1 - B / 2;
        const rose = o.rose || B * 0.66;
        g += `<path d="${rrect(x0, y0, x1, y1, R)}${rrect(x0 + B, y0 + B, x1 - B, y1 - B, ri)}" fill="${d.sandSoft}" fill-rule="evenodd" stroke="none"/>`;
        g += `<path d="${rrect(x0, y0, x1, y1, R)}" fill="none" stroke="${d.teal}" stroke-width="${f2(B * 0.09)}"/>`;
        g += `<path d="${rrect(x0 + B, y0 + B, x1 - B, y1 - B, ri)}" fill="none" stroke="${d.teal}" stroke-width="${f2(B * 0.06)}"/>`;
        // stars and dots along the band's centre line, between the corner rosettes
        const step = B * 1.5, sr = B * 0.33, dr = B * 0.075;
        const run = (a, b, put) => {
            const len = b - a - 2 * (rose + B * 0.35), n = Math.max(1, Math.round(len / step));
            for (let i = 0; i <= n; i++) put(a + rose + B * 0.35 + len * i / n, i % 2 === 0);
        };
        const mot = (x, y, isStar) => isStar ? `<use href="#dz-bstar" transform="translate(${f2(x)} ${f2(y)}) scale(${f2(sr)})"/>`
            : `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(dr * 1.6)}" fill="${d.coral}"/>`;
        run(cx0, cx1, (x, s) => { g += mot(x, cy0, s) + mot(x, cy1, s); });
        run(cy0, cy1, (y, s) => { g += mot(cx0, y, s) + mot(cx1, y, s); });
        [[cx0, cy0], [cx1, cy0], [cx0, cy1], [cx1, cy1]].forEach(([x, y]) => {
            g += `<use href="#dz-rose" transform="translate(${f2(x)} ${f2(y)}) scale(${f2(rose)}) rotate(22.5)"/>`;
        });
    } else if (kind === 'line') {
        const R = o.radius || 5, rose = o.rose || 2.6, gap = o.gap || 1.7;
        g += `<path d="${rrect(x0, y0, x1, y1, R)}" fill="none" stroke="${d.teal}" stroke-opacity=".55" stroke-width=".4"/>`;
        g += `<path d="${rrect(x0 + gap, y0 + gap, x1 - gap, y1 - gap, Math.max(R - gap, 1))}" fill="none" stroke="${d.goldDeep}" stroke-opacity=".7" stroke-width=".55" stroke-linecap="round" stroke-dasharray="0 1.9"/>`;
        [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].forEach(([x, y]) => {
            const ix = x === x0 ? x + R * 0.3 : x - R * 0.3, iy = y === y0 ? y + R * 0.3 : y - R * 0.3;
            g += `<use href="#dz-rose" transform="translate(${f2(ix)} ${f2(iy)}) scale(${f2(rose)}) rotate(22.5)"/>`;
        });
    } else if (kind === 'corner') {
        const rose = o.rose || 2.4, arm = o.arm || 16;
        [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]].forEach(([x, y, sx, sy]) => {
            g += `<path d="M${f2(x + sx * (rose + 1))} ${f2(y)}H${f2(x + sx * arm)}M${f2(x)} ${f2(y + sy * (rose + 1))}V${f2(y + sy * arm)}" stroke="${d.teal}" stroke-opacity=".5" stroke-width=".4" stroke-linecap="round" fill="none"/>`;
            g += `<circle cx="${f2(x + sx * arm)}" cy="${f2(y)}" r=".55" fill="${d.coral}"/><circle cx="${f2(x)}" cy="${f2(y + sy * arm)}" r=".55" fill="${d.coral}"/>`;
            g += `<use href="#dz-rose" transform="translate(${f2(x)} ${f2(y)}) scale(${f2(rose)}) rotate(22.5)"/>`;
        });
    }
    return `<svg class="dz-frame" viewBox="0 0 ${f2(w)} ${f2(h)}" style="width:${f2(w)}mm;height:${f2(h)}mm" aria-hidden="true">${g}</svg>`;
}

/** the web book's versions: CSS data URIs (px; 1mm of the print tile = 4px) */
function decoWebCss() {
    const svg = (vb, body, ww, hh) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${ww}' height='${hh}' viewBox='${vb}'>${body}</svg>`.replace(/"/g, "'"))}")`;
    const defs = `<defs>${decoShapes('w')}</defs>`;
    const tile = svg('0 0 26 26', `${defs}<g opacity='${DECO.ink.web}'><use href='#w-tile'/></g>`, 104, 104);
    const rose = svg('-1.05 -1.05 2.1 2.1', `${defs}<use href='#w-rose' transform='rotate(22.5)'/>`, 26, 26);
    return { tile, rose };
}

module.exports = { ROOT, ZWJ, esc, mark, plain, taWord, loadSpec, bookConfig, useTopic, topic, choices, interiorPages, webPages, audioPages, isExercise, arNum, pageUrl, draft,
    DECO, star8, decoDefs, decoPattern, decoFrame, decoWebCss };
