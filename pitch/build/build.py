#!/usr/bin/env python3
"""Builds pitch/index.html and the narration transcripts from PLAN.md.
Run: python3 pitch/build/build.py   (images: python3 pitch/build/images.py first)
"""
import re, json, glob, os, subprocess, html

R = '/Users/hishamabuella/Work/Arabic-school/'
P = R + 'pitch/'
S = '/Users/hishamabuella/Work/Presentation_Claude_SKILL/keynote_html_claude_skill/plugins/present-in-html/skills/present-in-html/'


# ---------- facts resolved at build time ----------
ART = len(glob.glob(R + 'assets/art/**/*.webp', recursive=True))   # web copies

# ---------- scripts from PLAN.md ----------
plan = open(P + 'PLAN.md', encoding='utf-8').read()
scripts = {}
for m in re.finditer(r'### \d+ · (\w+)\n\*\*EN\*\*: (.*?)\n\n\*\*EG\*\*: (.*?)\n', plan, re.S):
    scripts[m.group(1)] = {'en': m.group(2).strip(), 'eg': m.group(3).strip()}
assert len(scripts) == 12, len(scripts)
for k in scripts:
    e = scripts[k]['en']
    e = e.replace('classroom TV', 'classroom television').replace('QR code', 'Q R code').replace('an AI model', 'an artificial intelligence model')
    scripts[k]['en'] = e
for k in ('start', 'close'):
    for l in ('en', 'eg'):
        scripts[k][l] = '[warmly] ' + scripts[k][l]

TITLES = {
 'start': 'Nawras: Fusha for little hearts, by the Pacific',
 'idea': 'Fusha has our hours: one lesson, four ways',
 'name': 'The name: the seagull and Noori',
 'logo': 'Six logo ideas, one recommended',
 'look': 'Six layouts and six themes',
 'lesson': 'One lesson, three ways',
 'write': 'Writing on the screen',
 'book': 'The 32-page printed book',
 'adab': 'Islamic adab, and what Nawras is not',
 'grow': 'The five steps of every new lesson',
 'ask': 'Five decisions',
 'close': 'What your school has now',
}
TITLES_AR = {
 'start': 'نَوْرَس: الفصحى لقلوب صغيرة، على المحيط الهادي',
 'idea': 'الفصحى ليها ساعاتنا: درس واحد بأربع طرق',
 'name': 'الاسم: النورس ونوري',
 'logo': 'ست أفكار للشعار، وواحدة مرشّحة',
 'look': 'ست تصاميم وست ألوان',
 'lesson': 'درس واحد بتلات طرق',
 'write': 'الكتابة على الشاشة',
 'book': 'الكتاب المطبوع، اتنين وتلاتين صفحة',
 'adab': 'الأدب الإسلامي، واللي نَوْرَس مش هو',
 'grow': 'الخمس خطوات لكل درس جديد',
 'ask': 'خمس قرارات',
 'close': 'اللي عند مدرستكم دلوقتي',
}
ORDER = list(TITLES.keys())
assert set(ORDER) == set(scripts)

def write_transcripts():
    os.makedirs(P + 'audio/transcripts', exist_ok=True)
    for key, lang, titles, ttl in (('en', 'en', TITLES, 'Nawras owners pitch (English)'),
                                   ('eg', 'ar', TITLES_AR, 'Nawras owners pitch (Egyptian Arabic)')):
        d = {'title': ttl, 'language': lang, 'page': 'pitch/index.html',
             'note': 'One entry per slide, in slide order; ids are the deck data-ids.',
             'slides': [{'id': i, 'slide': n + 1, 'title': titles[i], 'transcript': scripts[i][key]}
                        for n, i in enumerate(ORDER)]}
        json.dump(d, open(P + f'audio/transcripts/pitch-{key}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# ---------- helpers ----------
def A(t):  # fully vowelled Arabic inline
    return f'<span class="ar" lang="ar">{t}</span>'

def notes(i, sources=''):
    s = scripts.get(i)
    if not s:
        return f'<aside class="notes"><p>{sources}</p></aside>'
    return ('<aside class="notes"><p>' + html.escape(s['en'], quote=False) + '</p><p>— مصري —</p><p>' + s['eg'] + '</p>'
            + (f'<p>Sources: {sources}</p>' if sources else '') + '</aside>')

def a(href, text, cls=''):
    c = f' class="{cls}"' if cls else ''
    return f'<a{c} href="{href}" target="_blank" rel="noopener">{text}</a>'

FILL = '<span class="fill" role="img" aria-label="to be filled in at the meeting">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>'

sl = []
def slide(i, layout, body, src, extra=''):
    sl.append(f'<section class="slide" data-layout="{layout}" data-id="{i}"{extra}>\n{body}\n{notes(i, src)}\n</section>')


# 1 start
slide('start', 'title', f'''<p class="label">{A("مَدْرَسَةُ نَوْرَس لِلْفُصْحَى")}</p>
<nav class="vsw bx-ui" aria-label="Narration voice"><a href="?voice=en" data-v="en">English</a><a href="?voice=eg" data-v="eg" lang="ar">{A("مَصْرِي")}</a></nav>
<img class="badge" src="img/hilal-badge.svg" alt="Gull and Crescent emblem, Nawras logo concept 1 (نَوْرَسُ الْهِلَالِ)">
<h1>{A("نَوْرَس")} <span class="h1en">Nawras: Fusha for little hearts, by the Pacific</span></h1>
<p class="sub">Five decisions in ten minutes.</p>
<p class="meta"><span>Nawras Fusha School, San Diego</span><span>{A("نَتَعَلَّمُ الْفُصْحَى بِفَرَحٍ")}</span></p>''',
 'BRIEF.md (brand, tagline); PLAN.md promise.', ' data-tone="hero"')

# 2 idea
slide('idea', 'statement', '''<p class="label">The idea</p>
<h2>Fusha has only our hours, so one lesson, written once, reaches the child <em>four ways</em></h2>
<ul class="chips" data-build="list"><li class="chip">on a screen at home</li><li class="chip">on the classroom TV with the teacher</li><li class="chip">in a printed book they write in</li><li class="chip">read aloud in their ears</li></ul>
<p class="close-line">Teachers teach. Nawras makes it joyful.</p>''',
 'BRIEF.md (one spec feeds the web book, the Lulu PDFs and the narration); lessons/presentation/PLAN.md audience line (many pupils speak English or a dialect at home). No statistics: the owners know their children.')

# 3 name
slide('name', 'image-right', f'''<figure><img src="img/noori-happy.webp" alt="Noori the young seagull, smiling (نُورِي)"></figure>
<h2>The seagull flies far and comes home, like our children returning to the language of the Qur'an</h2>
<ul data-build="list">
<li>{A("نَوْرَس")} Nawras = the seagull, San Diego's coastal bird</li>
<li>Mascot {A("نُورِي")} Noori, from {A("نُور")} light: round, kind, never scary</li>
<li>{A("نَتَعَلَّمُ الْفُصْحَى بِفَرَحٍ")} Fusha for little hearts, by the Pacific</li>
</ul>
<p class="src">Also prepared: {A("شَاطِئُ الضَّاد")} · {A("لُؤْلُؤَةُ الْفُصْحَى")} · {A("الْأَنْدَلُسُ الصَّغِيرَة")} · {A("هِلَال")}</p>''',
 'BRIEF.md (name, mascot, tagline, alternate names).')

# 4 logo (interactive)
logos = [
 ('c1', 'نَوْرَسُ الْهِلَالِ', 'Gull &amp; Crescent', 'The crescent says Islamic, the wave says San Diego, Noori says kids.'),
 ('c2', 'قَوْسُ الْأَنْدَلُسِ', 'Andalusian Arch', "San Diego's mission arches descend from Andalusian arches; inside, a Pacific sunset."),
 ('c3', 'نَجْمَةُ الْخَاتَمِ', 'Khatam Star', 'The eight-point star is a classic Islamic pattern; the gull at its heart makes it ours.'),
 ('c4', 'كِتَابُ الْمَوْجِ', 'Book of Waves', 'Book pages become the sea: learning that carries children far and brings them home.'),
 ('c5', 'فَانُوسُ نُورِي', "Noori's Lantern", "Noori's name comes from nur, light; a warm lantern that glows on dark backgrounds."),
 ('c6', 'وَجْهُ نُورِي', 'Noori Face Mark', 'The simplest mark, the friend children already know; clear even at 32 px.'),
]
tags = {'c1': 'Recommended', 'c6': 'App icon'}
thumbs = ''.join(
 f'<button type="button" class="lthumb{" on" if k=="c1" else ""}" data-logo="{k}" aria-pressed="{"true" if k=="c1" else "false"}" aria-label="Logo {n+1}: {en}" data-ar="{ar}" data-en="{en}" data-why="{why}" data-tag="{tags.get(k,"")}"><img src="img/logo-{k}.webp" alt=""><span>{n+1}</span></button>'
 for n, (k, ar, en, why) in enumerate(logos))
slide('logo', 'two-column', f'''<h2>We recommend the Gull and Crescent, with Noori's face as the app icon</h2>
<div class="demo logo-demo bx-ui">
<div class="lstage" id="lstage" data-bg="light"><img id="lbig" src="img/logo-c1.webp" alt="Logo concept 1: Gull and Crescent"><p class="wordmark">{A("نَوْرَس")}</p></div>
<div class="linfo">
<div class="lthumbs" role="group" aria-label="Choose a logo">{thumbs}</div>
<h3 id="lname"><span class="ar" lang="ar">نَوْرَسُ الْهِلَالِ</span> <span id="lname-en">Gull &amp; Crescent</span></h3>
<p id="lwhy">The crescent says Islamic, the wave says San Diego, Noori says kids.</p>
<p class="lrow"><span class="ltag" id="ltag">Recommended</span> <img id="lfav" class="lfav" src="img/logo-c1.webp" alt="" width="32" height="32"> <span class="lsmall">32 px</span>
<button type="button" class="lbg on" data-bg="light" aria-pressed="true">Light</button><button type="button" class="lbg" data-bg="dark" aria-pressed="false">Dark</button></p>
<p class="lsmall">{a("../logos/index.html", "All six on one page →")}</p>
</div></div>''',
 'logos/index.html (names, reasons, "Recommended" on concept 1, pair with concept 6); logos/source/gen-logos.sh (28 versions tried; no text in the emblems; 2 vector SVGs, for 1 and 6).')

# 5 look (interactive)
LAYOUTS = [('01-andalus', 'Garden arch', 'andalus'), ('02-pacific', 'Ocean', 'pacific'), ('03-fanous', 'Lanterns', 'fanous'),
           ('04-kurrasa', 'Notebook', 'kurrasa'), ('05-mosaic', 'Mosaic tiles', 'mosaic'), ('06-mihrab', 'Soft arch', 'mihrab')]
THEMES = [('andalus', 'الْأَنْدَلُسُ', 'Andalus', 'Garden arches and fountains, warm terracotta and green.'),
          ('pacific', 'الْمُحِيطُ', 'Pacific', 'Sunset ocean and palms: the most playful.'),
          ('fanous', 'الْفَانُوسُ', 'Fanous', 'Night lanterns, calm and a little magical.'),
          ('kurrasa', 'الْكُرَّاسَةُ', 'Kurrasa', 'A school notebook, with a writing pad.'),
          ('mosaic', 'الْفُسَيْفِسَاءُ', 'Mosaic', 'Bold tiles and eight-pointed stars.'),
          ('mihrab', 'الْمِحْرَابُ', 'Mihrab', 'Soft, pastel and quiet, for parents and older kids.')]
lb = ''.join(f'<button type="button" class="pbt{" on" if f=="02-pacific" else ""}" data-layout="{f}" data-native="{nt}" aria-pressed="{"true" if f=="02-pacific" else "false"}"><b>{i+1}</b> {n}</button>' for i, (f, n, nt) in enumerate(LAYOUTS))
tb = ''.join(f'<button type="button" class="pbt{" on" if t=="pacific" else ""}" data-theme-id="{t}" aria-pressed="{"true" if t=="pacific" else "false"}" data-ar="{ar}" data-en="{en}" data-mood="{m}">{en}</button>' for t, ar, en, m in THEMES)
slide('look', 'two-column', f'''<h2>Six layouts and six colour themes are live: which one feels like your school?</h2>
<div class="demo look-demo bx-ui">
<div class="lframe"><iframe id="lookframe" src="../mockups/02-pacific.html" title="Live homepage mockup" tabindex="-1" loading="lazy"></iframe></div>
<div class="lctl">
<p class="lrowlab">Layout</p><div class="pgrid" id="layoutbtns" role="group" aria-label="Layout">{lb}</div>
<p class="lrowlab">Theme</p><div class="pgrid" id="themebtns" role="group" aria-label="Theme">{tb}</div>
<p class="tname" id="tname"><span class="ar" lang="ar">الْمُحِيطُ</span> Pacific</p>
<p class="tmood" id="tmood">Sunset ocean and palms: the most playful.</p>
</div></div>''',
 'index.html (hub descriptions of the six looks; "flagship" on Andalus is the designer\'s mark, not a decision); mockups/01-andalus.html to 06-mihrab.html; assets/kids.js (?theme= and postMessage).')

# 6 lesson
cards = [
 ('article', 'مَقَالَةٌ مُصَوَّرَةٌ', 'Tap to hear, 5-question check, printable worksheet, about 15 min', '../lessons/article.html', 'Open the article', 'Screenshot of the read-along article'),
 ('story', 'قِصَّةٌ تَفَاعُلِيَّةٌ', 'Noori, Sami and Salma, read aloud in Fusha or Egyptian', '../lessons/story.html', 'Open the story', 'Screenshot of the interactive story'),
 ('slides', 'عَرْضٌ لِلصَّفِّ', '18 slides, about 20 min, with games and quizzes', '../lessons/presentation.html', 'Open the slides', 'Screenshot of the classroom slides'),
]
cols = ''.join(f'''<div class="col" data-build="rise"><img src="img/lesson-{k}.png" alt="{alt} ({ar})"><h3>{A(ar)}</h3><p>{d}</p><p>{a(h, t)}</p></div>''' for k, ar, d, h, t, alt in cards)
slide('lesson', 'two-column', f'''<p class="label">Grade 1–2 · masculine and feminine · the final tā' marbūṭa is Noori's little seashell</p>
<h2>One lesson, {A("هَذَا وَهَذِهِ")}, is ready three ways: to read, to hear, to present</h2>
<div class="cols">{cols}</div>''',
 'index.html lesson cards; lessons/article.html, story.html, presentation/PLAN.md. (story.html has recorded clips on pages 2, 4 and 7; the other pages use the device voice for now.)',
 ' data-cols="3"')

# 7 write
slide('write', 'image-left', f'''<figure><img src="img/writing-pad.png" alt="The writing pad: tracing the ة and هَذِهِ with three stars and عَمَلٌ رَائِعٌ (great work)"></figure>
<h2>Children write with a finger or an Apple Pencil, and are praised, never marked wrong</h2>
<ul data-build="list">
<li>Trace the {A("ة")}, then {A("هَذَا / هَذِهِ")}, then a sentence under a picture</li>
<li>Start at the green dot, right to left</li>
<li>Big buttons: pen colours, eraser, undo, clear, save</li>
<li>{A("انْتَهَيْتُ")} "I finished" gives a star; no auto-grading</li>
</ul>
<p class="src">{a("../lessons/story.html", "Try it")}</p>''',
 'BRIEF.md, "Writing practice"; lessons/story.html.')

# 8 book
P_ = '../book/print/noori-shell-'
slide('book', 'image-right', f'''<figure class="wide"><img src="img/book-pages.png" alt="All 32 interior pages of the book Noori and the Little Shell">
<div class="qrrow"><img class="qr" src="img/qr-book.svg" alt="QR code to the web book, hisham-abuella.github.io/Madrasa/book/books/noori-shell.html"><div class="bx-ui listenbtns"><p>Scan, or listen:</p><button type="button" class="lbtn" data-clip="audio/clips/salam-fusha.mp3">{A("فُصْحَى")}</button> <button type="button" class="lbtn" data-clip="audio/clips/salam-eg.mp3">{A("مَصْرِي")}</button></div></div></figure>
<h2>A 32-page printed book, and its QR code reads it aloud</h2>
<ul data-build="list">
<li>8.5 × 8.5 in square, full colour, printed on demand by Lulu</li>
<li>14 story pages, 11 exercises, certificate, answers</li>
<li>Read aloud in two voices: Fusha (Sarah) and Egyptian (Hisham)</li>
</ul>
<p class="pdfbtns bx-ui">{a(P_+"lulu-interior.pdf", "See the book (PDF)", "pbtn")}{a(P_+"lulu-cover.pdf", "Cover (PDF)", "pbtn")}{a(P_+"home-a5.pdf", "Print at home (A5 booklet)", "pbtn")}{a(P_+"worksheets-letter.pdf", "Worksheets (Letter)", "pbtn")}{a(P_+"worksheets-a4.pdf", "Worksheets (A4)", "pbtn")}{a("../book/books/noori-shell.html", "Web book", "pbtn")}</p>''',
 'book/README.md (page map, Printing, Status: 56 clips, 28 Fusha by Sarah, 28 Egyptian by Hisham; 12 QR codes, 48 decodes; Lulu 8.5 in square, Premium Color; spine 0.1321 in); book/book.config.json; book/print/*.pdf. Narration credits are covered by the existing ElevenLabs plan.')

# 9 adab + fence
slide('adab', 'two-column', '''<h2>Every picture follows Islamic adab, and Nawras serves your teachers, never replaces them</h2>
<div class="cols">
<div class="col is" data-build="rise"><h3>Our adab rules</h3><ul><li>No pictures of prophets or angels</li><li>No Qur'an verses as decoration or in games</li><li>Modest clothing on every child</li><li>No music, only soft sounds</li></ul></div>
<div class="col not" data-build="rise"><h3>What Nawras is not</h3><ul><li>Not a replacement for the teacher</li><li>Not an app, no subscription for families</li><li>Not auto-grading of handwriting</li><li>Not yet a full curriculum: one lesson so far</li></ul></div>
</div>''',
 'BRIEF.md, "Respectful content rules" (also: children greet with السَّلَامُ عَلَيْكُمْ; pictures redrawn when not modest, book/README.md Status); BRIEF.md (plain pages, no auto-grading, the teacher presents); lessons/presentation/PLAN.md.')

# 10 grow
slide('grow', 'process', f'''<h2>Every new lesson follows the same five steps, from one written lesson to screen, paper and sound</h2>
<ol class="steps" data-build="list">
<li><h3>Write once</h3><p>Every word in Fusha</p></li>
<li><h3>Draw the pictures</h3><p>On our own computer</p></li>
<li><h3>Build web book and slides</h3><p>From the same text</p></li>
<li><h3>Make print files</h3><p>Checked automatically</p></li>
<li><h3>Record the narration</h3><p>Checked word by word</p></li>
</ol>
<p class="strip"><span class="chip">In progress: colour picture set, {ART} pictures so far</span> <span class="chip">Next: a short guide for images and animation</span></p>''',
 'BRIEF.md (The lesson book; Illustrated artwork pass); book/README.md (Rebuild everything); assets/art/source/gen-art.sh. Picture count = web copies in assets/art at build time. The guide does not exist yet: presented as the next step.')

# 11 ask (cost, timeline, decisions)
slide('ask', 'ask', f'''<h2>Five decisions today let one class start</h2>
<ol class="decisions" data-build="list">
<li><b>Look</b> <span>One of the six layouts and themes: your call</span></li>
<li><b>Logo</b> <span>Gull &amp; Crescent + Noori face (recommended)</span></li>
<li><b>Pilot class</b> <span>Grade and teacher {FILL} from {FILL}</span></li>
<li class="hotitem"><b>Fusha proofreading</b> <span>One teacher checks every vowel mark before printing</span></li>
<li><b>Printing budget</b> <span>Lulu about $8–15 a copy: $160–300 for a class of 20</span></li>
</ol>
<p class="strip cost"><span class="chip">Proof copy first: 5–10 days</span> <span class="chip">Website: $0 extra</span> <span class="chip">Home booklet: $1–3</span> <span class="chip">Estimates, Oct 2026</span></p>''',
 'book/README.md cost estimate; PRINTING-GUIDE.md section 4 (Lulu paperback about $8–15 plus shipping about $5–10; Lulu 5–10 days; home booklet about $1–3). Class of 20 = 20 × $8 = $160 to 20 × $15 = $300, books only, shipping extra; confirm in Lulu\'s calculator before ordering. Hosting: $0 extra, GitHub Pages on the existing account (decision 2026-10-25). No Lulu proof copy has been printed yet. The pilot blanks are decisions for the owners in the meeting.')

# 12 close
slide('close', 'closing', f'''<img class="cheer" src="img/noori-cheer.webp" alt="Noori the seagull cheering (نُورِي)">
<h2>Your school now has a name, a look, a lesson and a book, ready for one class to try</h2>
<p class="tagline">{A("نَتَعَلَّمُ الْفُصْحَى بِفَرَحٍ")}</p>
<p class="contact"><span><b>Web</b> hisham-abuella.github.io/Madrasa</span></p>''',
 'Restates the story as what the owners now have.')

# ---------- CSS ----------
CSS = r'''
html[data-theme="trainer"]{
  --brand:#0B7A7E; --brand-text:#0B6E72; --on-brand:#FFFFFF;
  --s1:#0B7A7E; --bleed-bg:#0B7A7E;
  --hero-bg:#0B3540; --hero-ink:#FFF9EE; --hero-ink2:#BFE3E6;
  --hero-brand:#FFC94A; --hero-rule:#1F5A66;
  --bg2:#FFF6E0; --rule:#CBE6E2; --muted-bar:#CBE6E2;
  --hot:#FF7A5C; --hot-text:#B8391C;
  --ink:#0B3540; --ink2:#3A6470;
}
html{ --f-naskh:"Noto Naskh Arabic","Geeza Pro","Amiri",serif; }
.ar{ font-family:var(--f-naskh); direction:rtl; unicode-bidi:isolate; letter-spacing:0; font-weight:700; }
html[data-theme="trainer"] .slide:not(:is([data-layout="title"],[data-layout="section"],[data-layout="closing"],[data-layout="full-bleed"],[data-tone="hero"]))::before{content:"";position:absolute;top:0;inset-inline:0;height:40px;z-index:-1;pointer-events:none;background:url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><g fill='none' stroke='%230B7A7E' stroke-opacity='.45' stroke-width='1.5'><rect x='10' y='10' width='20' height='20'/><rect x='10' y='10' width='20' height='20' transform='rotate(45 20 20)'/></g></svg>") repeat-x 0 0/40px 40px;border-bottom:1px solid var(--rule)}

/* fill-in blank: a decision for the owners */
.fill{display:inline-block;width:5em;height:1em;border-bottom:4px solid var(--hot-text);vertical-align:-.1em;overflow:hidden;white-space:nowrap;font-size:inherit}
time .fill{width:3.5em;margin-top:6px}
/* slide 1 */
.badge{position:absolute;inset-inline-end:140px;top:300px;width:300px;height:auto;filter:drop-shadow(0 0 0 transparent)}
[data-layout="title"] h1 .ar{font-size:1.25em;line-height:1.1}
.vsw{background:#0B3540;position:absolute;top:110px;inset-inline-end:120px;display:flex;gap:0;border:2px solid var(--hero-ink2);border-radius:999px;overflow:hidden;font-size:28px;z-index:3}
.vsw a{color:#FFF9EE;text-decoration:none;padding:8px 26px;line-height:1.3}
.vsw .ar{line-height:1.2}
.h1en{display:block;font-family:var(--f-display);font-size:64px;font-weight:500;letter-spacing:0;line-height:1.2;margin-top:12px;max-width:1100px}
.meta{bottom:120px}
.meta .ar{line-height:1.2}
.vsw a.on{background:#FFC94A;color:#0B3540!important;font-weight:700}
/* slide 2 */
[data-layout="agenda"] .foot-line{grid-column:1/6;grid-row:1;align-self:end;font-size:30px;font-family:var(--f-mono)}
/* slide 4 */
ul.chips{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:20px;margin-block-start:48px;font-size:44px}
ul.chips li.chip{display:inline-block;background:var(--bg2);border-color:var(--brand);font-family:var(--f-body)}
.close-line{font-weight:600;color:var(--brand-text)!important}
/* slide 8 */
[data-layout="two-column"][data-cols="3"] .col img{width:100%;height:140px;object-fit:cover;object-position:top;border-radius:12px;border:2px solid var(--rule);margin-bottom:20px;display:block}
[data-layout="two-column"][data-cols="3"] .col h3{margin-bottom:12px}
[data-layout="two-column"][data-cols="3"] .col p+p{margin-top:12px}
[data-layout^="image-"] .src{margin-top:32px}
/* slide 10 */
.strip{margin-top:60px;display:flex;gap:20px;flex-wrap:wrap}
.strip .chip{font-size:30px;padding-block:0;font-family:var(--f-body);background:var(--bg2)}
/* slide 15 */
.col.not{border-top:8px solid var(--hot)} .col.is{border-top:8px solid var(--brand)}
/* slide 18 */
ol.decisions{grid-column:1/-1;grid-row:3;list-style:none;padding:0;counter-reset:d;display:flex;flex-direction:column;gap:18px;align-self:center}
ol.decisions li{counter-increment:d;display:grid;grid-template-columns:90px 420px 1fr;align-items:baseline;font-size:36px;line-height:1.25;padding:10px 0;border-bottom:1px solid var(--rule)}
ol.decisions li::before{content:counter(d);font:700 54px var(--f-display);color:var(--brand-text)}
ol.decisions li b{font-size:40px}
ol.decisions li.hotitem{background:#FF7A5C;border-bottom-color:#FF7A5C;color:#0B3540;box-shadow:-24px 0 0 #FF7A5C,24px 0 0 #FF7A5C}
ol.decisions li.hotitem::before,ol.decisions li.hotitem b,ol.decisions li.hotitem .fill{color:#0B3540}
ol.decisions .fill{border-bottom-color:currentColor}
/* slide 12 */
.cheer{border-radius:56px;position:absolute;inset-inline-end:140px;top:150px;width:520px;height:520px;object-fit:contain}
[data-layout="closing"] h2{font-size:104px;max-width:1280px;letter-spacing:-0.02em;line-height:1.08}
.tagline{font-size:64px;margin-bottom:40px;color:var(--hero-brand)}

/* slide 4: logo switcher */
.demo{display:flex;gap:56px;align-items:flex-start;margin-block:auto;padding-block-end:20px}
.lstage{flex:none;width:560px;height:600px;border-radius:24px;border:3px solid var(--rule);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:#fff;transition:background .2s}
.lstage[data-bg="dark"]{background:#0B3540;border-color:#0B3540}
.lstage img{width:380px;height:380px;object-fit:contain}
.lstage .wordmark{font-size:96px;line-height:1.3;margin:0;color:#0B3540}
.lstage[data-bg="dark"] .wordmark{color:#FFF9EE}
.linfo{flex:1;min-width:0}
.lthumbs{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:28px}
.lthumb{position:relative;background:#fff;color:#0B3540;border:3px solid var(--rule);border-radius:16px;padding:6px;cursor:pointer;font:inherit}
.lthumb img{width:100%;aspect-ratio:1;display:block;object-fit:contain}
.lthumb span{position:absolute;top:-8px;inset-inline-start:-8px;background:var(--brand);color:var(--on-brand);font:700 28px/1 var(--f-display);min-width:40px;height:40px;border-radius:20px;display:grid;place-items:center}
.lthumb.on{border-color:var(--hot);box-shadow:0 0 0 3px var(--hot)}
.linfo h3{font-size:52px;line-height:1.35;margin:0 0 12px}
.linfo h3 .ar{display:block;font-size:1.25em;line-height:1.5}
#lwhy{font-size:34px;line-height:1.4;color:var(--ink2);margin:0 0 22px;min-height:3em}
.lrow{display:flex;align-items:center;gap:20px;flex-wrap:wrap;margin:0 0 20px}
.ltag{font:700 28px/1 var(--f-body);color:var(--hot-text);border:3px solid var(--hot);border-radius:999px;padding:8px 20px;white-space:nowrap}
.ltag:empty{display:none}
.lfav{width:32px;height:32px;border:1px solid var(--rule);border-radius:50%}
.lsmall{font-size:28px;color:var(--ink2);margin:0}
.lbg,.pbt{font:inherit;font-size:28px;line-height:1.2;cursor:pointer;background:var(--bg);color:var(--ink);border:3px solid var(--rule);border-radius:999px;padding:8px 24px}
.lbg.on,.pbt.on{background:var(--brand);color:var(--on-brand);border-color:var(--brand)}
.lbg:first-of-type{margin-inline-start:auto}
/* slide 5: look switcher */
.lframe{flex:none;width:1000px;height:625px;border-radius:20px;overflow:hidden;border:3px solid var(--rule);background:#fff;position:relative}
.lframe iframe{position:absolute;top:0;left:0;width:1280px;height:800px;border:0;transform:scale(.78125);transform-origin:0 0;pointer-events:none}
.lctl{flex:1;min-width:0}
.lrowlab{font:700 28px/1.2 var(--f-body);color:var(--brand-text);margin:0 0 10px;text-transform:uppercase;letter-spacing:.06em}
.pgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}
.pbt{border-radius:16px;text-align:start;padding:8px 16px}
.pbt b{margin-inline-end:6px}
.tname{font:700 44px/1.4 var(--f-display);margin:0}
.tname .ar{font-size:1.1em}
.tmood{font-size:30px;line-height:1.35;color:var(--ink2);margin:4px 0 0}
/* slide 8: book */
figure.fig.wide{width:840px;background:var(--bg2);display:flex;flex-direction:column;justify-content:center;align-items:center;gap:36px;padding:0 40px}
figure.fig.wide>img{width:100%;height:auto;max-height:420px;object-fit:contain}
.qrrow{display:flex;gap:36px;align-items:center}
img.qr{width:260px;height:260px;background:#fff;display:block;flex:none}
.listenbtns p{font-size:30px!important;margin:0 0 14px;color:var(--ink2)}
.lbtn{font:inherit;font-size:34px;cursor:pointer;background:var(--brand);color:var(--on-brand);border:0;border-radius:var(--radius);padding:12px 28px;margin:0 8px 8px 0}
.lbtn.playing{background:var(--hot-text)}
.pdfbtns{display:flex;flex-wrap:wrap;gap:12px;margin-top:40px!important}
a.pbtn{font-size:28px;line-height:1.2;text-decoration:none;background:var(--brand);color:var(--on-brand);border-radius:999px;padding:10px 22px;white-space:nowrap}
a.pbtn:hover,a.pbtn:focus-visible{background:var(--hot-text)}
/* slide 9 */
.col.is,.col.not{border-top-width:8px}
/* slide 11 */
.strip.cost{grid-column:1/-1;grid-row:4;margin-top:20px}
'''


JS = r'''<script>
/* Narration track: English by default, Egyptian with ?voice=eg (or localStorage.nawrasVoice). Runs before the engine. */
(function(){
  var q=(location.search.match(/[?&]voice=(en|eg)/)||[])[1], v='en';
  try{ if(q) localStorage.nawrasVoice=q; v=q||localStorage.nawrasVoice||'en'; }catch(e){ v=q||'en'; }
  if(v!=='eg') v='en';
  document.querySelector('main.deck').setAttribute('data-narration','audio/'+v+'/');
  document.addEventListener('DOMContentLoaded',function(){
    var l=document.querySelectorAll('.vsw a'); for(var i=0;i<l.length;i++){ if(l[i].dataset.v===v) l[i].className='on'; }
  });
})();
</script>'''

JS2 = r'''<script>
/* Book slide: listen buttons play on click only; they stop when the slide is left. */
(function(){
  var sl=document.querySelector('[data-id="book"]'); if(!sl) return;
  var au=new Audio(), cur=null, btns=sl.querySelectorAll('.lbtn');
  function stop(){ au.pause(); cur=null; btns.forEach(function(b){b.classList.remove('playing');}); }
  btns.forEach(function(b){ b.addEventListener('click',function(e){
    e.stopPropagation();
    if(cur===b){ stop(); return; }
    stop(); cur=b; b.classList.add('playing'); au.src=b.dataset.clip; au.play().catch(stop);
  }); });
  au.addEventListener('ended',stop);
  new MutationObserver(function(){ if(!sl.classList.contains('is-current')) stop(); }).observe(sl,{attributes:true,attributeFilter:['class']});
  document.querySelectorAll('.vsw').forEach(function(n){ n.addEventListener('click',function(e){e.stopPropagation();}); });
})();
/* Logo switcher (slide 4). */
(function(){
  var sl=document.querySelector('[data-id="logo"]'); if(!sl) return;
  var big=sl.querySelector('#lbig'), fav=sl.querySelector('#lfav'), st=sl.querySelector('#lstage');
  function pick(b){
    sl.querySelectorAll('.lthumb').forEach(function(t){ var on=t===b; t.classList.toggle('on',on); t.setAttribute('aria-pressed',on); });
    var k=b.dataset.logo; big.src='img/logo-'+k+'.webp'; fav.src='img/logo-'+k+'.webp';
    big.alt='Logo '+b.querySelector('span').textContent+': '+b.dataset.en;
    sl.querySelector('#lname .ar').textContent=b.dataset.ar; sl.querySelector('#lname-en').innerHTML=b.dataset.en;
    sl.querySelector('#lwhy').textContent=b.dataset.why; sl.querySelector('#ltag').textContent=b.dataset.tag;
  }
  sl.querySelectorAll('.lthumb').forEach(function(b){ b.addEventListener('click',function(e){ e.stopPropagation(); pick(b); }); });
  sl.querySelectorAll('.lbg').forEach(function(b){ b.addEventListener('click',function(e){ e.stopPropagation();
    sl.querySelectorAll('.lbg').forEach(function(x){ var on=x===b; x.classList.toggle('on',on); x.setAttribute('aria-pressed',on); });
    st.dataset.bg=b.dataset.bg; }); });
})();
/* Look switcher (slide 5): layout = iframe src, theme = postMessage plus ?theme= (assets/kids.js reads both). */
(function(){
  var sl=document.querySelector('[data-id="look"]'); if(!sl) return;
  var fr=sl.querySelector('#lookframe'), layout='02-pacific', chosen=null;
  var tb=sl.querySelectorAll('[data-theme-id]'), lbs=sl.querySelectorAll('[data-layout]');
  function showTheme(id){
    tb.forEach(function(t){ var on=t.dataset.themeId===id; t.classList.toggle('on',on); t.setAttribute('aria-pressed',on); if(on){
      sl.querySelector('#tname').innerHTML='<span class="ar" lang="ar">'+t.dataset.ar+'</span> '+t.dataset.en; sl.querySelector('#tmood').textContent=t.dataset.mood; } });
  }
  function url(){ return '../mockups/'+layout+'.html'+(chosen?'?theme='+chosen:''); }
  lbs.forEach(function(b){ b.addEventListener('click',function(e){ e.stopPropagation();
    layout=b.dataset.layout; lbs.forEach(function(x){ var on=x===b; x.classList.toggle('on',on); x.setAttribute('aria-pressed',on); });
    fr.src=url(); showTheme(chosen||b.dataset.native); }); });
  tb.forEach(function(b){ b.addEventListener('click',function(e){ e.stopPropagation();
    var id=b.dataset.themeId; chosen=id; showTheme(id);
    try{ fr.contentWindow.postMessage({nawras:'theme',id:id},'*'); }catch(x){}
    setTimeout(function(){ var ok=false; try{ ok=fr.contentDocument.documentElement.getAttribute('data-theme')===id; }catch(x){}
      if(!ok){ var u=url(); if(fr.getAttribute('src')!==u) fr.src=u; } },350); }); });
})();
</script>'''


# ---------- assemble ----------
base = open(P + 'build/_base.html', encoding='utf-8').read()
slides_html = '\n\n'.join(sl)
out = base.replace('<!-- NAWRAS-CSS -->', '<style id="nawras">' + CSS + '</style>')
out = re.sub(r'<!-- SLIDES:START -->.*<!-- SLIDES:END -->', lambda m: '<!-- SLIDES:START -->\n' + slides_html + '\n<!-- SLIDES:END -->', out, flags=re.S)
out = out.replace('<!-- NAWRAS-JS -->', JS)
out = out.replace('<!-- NAWRAS-JS2 -->', JS2)
open(P + 'index.html', 'w', encoding='utf-8').write(out)
write_transcripts()
print('built; slides:', len(sl), 'art:', ART)
