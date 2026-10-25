#!/usr/bin/env node
/**
 * Draft the narration transcripts for the book from its spec.
 * (Adapted from bedtime-stories/tools/make-transcripts.js.)
 *
 *   node tools/make-transcripts.js stories/<slug>.json
 *
 * Writes source/<slug>-{ar,eg}.json in the format ~/Work/Elevenlabs-voice/generate.js
 * expects, one slide per narrated web page, id = the page key (audio/<lang>/<key>.mp3).
 * The words come from the spec, so the narration cannot drift from the printed page:
 *
 *   ar  Fusha (Sarah). A page's ar.say is used as written; otherwise the page is read
 *       as "[tag] heading. <break> line <break> [softly] refrain", the bedtime pattern.
 *   eg  Egyptian (Hisham's clone). Always eg.say: Egyptian that explains, keeping the
 *       Fusha target words (هذا / هذه and the nouns) exactly as on the page.
 *
 * The opening tag can be set per page in the spec as "tag"; the default is [warmly].
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { plain, audioPages, ROOT } = require('./lib');

const specPath = process.argv[2];
if (!specPath) { console.error('usage: make-transcripts.js stories/<slug>.json'); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const pages = audioPages(spec);

function build(lang) {
    const slides = pages.map((p, i) => {
        const c = p[lang] || {};
        const a = p.ar || {};
        let body = c.say;
        if (!body && lang === 'ar' && p.type === 'story') {
            const open = p.tag || '[warmly]';
            const close = p.key === 'bye' ? '[softly]' : '[cheerful]';
            const name = plain(a.name), stop = /[.!?…؟]$/.test(name) ? '' : '.';
            body = `${open} ${name}${stop} <break time="0.4s" /> ${plain(a.line)} <break time="0.5s" /> ${close} ${plain(a.sound)}`;
        }
        if (!body) { console.error(`! page ${p.key}: no ${lang} narration (add ${lang}.say)`); process.exitCode = 1; body = ''; }
        return { id: p.key, title: plain(a.name || a.title || a.eyebrow || p.key), transcript: plain(body.replace(/<break/g, '\u0000break')).replace(/\u0000break/g, '<break') || body };
    });
    const meta = lang === 'ar'
        ? { voice: 'EXAVITQu4vr4xnSDxMaL', note: 'Fusha — Sarah' }
        : { voice: 'pusofH2Ro5Ny4RH6qBEO', note: 'Egyptian — Hisham (cloned)' };
    return { title: `${plain(spec.title)} ${lang.toUpperCase()}`, language: 'ar', ...meta,
             model: 'eleven_v4', settings: { stability: 0.5, similarity_boost: 0.8 }, slides };
}

for (const lang of ['ar', 'eg']) {
    const out = path.join(ROOT, 'source', `${spec.slug}-${lang}.json`);
    try {
        if (JSON.parse(fs.readFileSync(out, 'utf8')).polished) {
            console.log(`source/${spec.slug}-${lang}.json — polished by hand, kept`);
            continue;
        }
    } catch (e) { /* no script yet */ }
    const t = build(lang);
    fs.writeFileSync(out, JSON.stringify(t, null, 1) + '\n');
    const chars = t.slides.reduce((n, s) => n + s.transcript.length, 0);
    console.log(`source/${spec.slug}-${lang}.json — ${t.slides.length} slides, ${chars} characters`);
}
