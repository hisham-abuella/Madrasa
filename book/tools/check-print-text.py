#!/usr/bin/env python3
"""Check a printed edition against the HTML it was rendered from.
(Copied from bedtime-stories; the only change is the eight-token rejoin below.)

  tools/check-print-text.py build/<book>.html print/<dir>/<book>.pdf [--min-pt 14]

Two things a PDF can get wrong without looking wrong:

  clipped  overflow:hidden drops the end of a long page silently. Each sheet's
           story lines (.line, .sound) must end on the matching PDF page, so the
           last three words of each are looked for there.
  small    every word's box height is turned into an approximate point size
           (box height / 1.41 for these fonts, checked against 13.5pt CSS).
           A page whose median story word is under --min-pt fails. 14pt is the
           floor for reading aloud from a printed page.

Needs pdftotext (poppler).
"""
import html, re, subprocess, sys, statistics, unicodedata
from collections import Counter

args = sys.argv[1:]
min_pt = 14.0
if '--min-pt' in args:
    i = args.index('--min-pt'); min_pt = float(args[i + 1]); del args[i:i + 2]
src, pdf = args

doc = open(src, encoding='utf-8').read()
sheets = re.split(r'<section class="sheet', doc)[1:]

def sig(w):
    """A word as its sorted base letters. pdftotext reorders letters inside
    some Arabic words (في comes back as يف) and returns presentation forms, so
    words are compared as bags of letters, without diacritics."""
    w = unicodedata.normalize('NFKC', w)
    w = ''.join(c for c in w if c.isalnum() and not unicodedata.combining(c))
    return ''.join(sorted(w.replace('ى', 'ي').replace('ة', 'ه').lower()))

def words(t):
    t = html.unescape(re.sub(r'<[^>]+>', '', t)).replace('\u200d', '').replace('’', '').replace("'", '')
    return [w for w in re.findall(r'[\w؀-ۿ]+', t) if sig(w)]

bbox = subprocess.run(['pdftotext', '-bbox', pdf, '-'], capture_output=True, text=True, check=True).stdout
pages = bbox.split('<page ')[1:]
if len(pages) != len(sheets):
    print(f'page count differs: {len(sheets)} sheets, {len(pages)} PDF pages'); sys.exit(1)

bad = 0
for n, (sheet, page) in enumerate(zip(sheets, pages), 1):
    boxes = [(float(a), float(b), html.unescape(w)) for a, b, w in
             re.findall(r'yMin="([\d.]+)"[^>]*yMax="([\d.]+)">([^<]*)<', page)]
    toks = [x for _, _, w in boxes for x in re.findall(r'[\w\u0600-\u06FF]+', w.replace('’', '').replace("'", ''))]
    # pdftotext also splits some Arabic words in two (جدًا comes back as جًد ا)
    # or, around a shadda, in three (عَضّة comes back as َع ّض ة), so each run of
    # two or three neighbouring tokens counts as a word too
    # Fully vocalised Naskh (this book) comes back in up to six or seven pieces
    # per word, so runs of up to eight neighbouring tokens are tried.
    on_page = set()
    for k in range(1, 9):
        on_page |= {sig(''.join(toks[i:i + k])) for i in range(len(toks) - k + 1)}
    letters = Counter(''.join(sig(x) for x in toks))
    problems = []
    for para in re.findall(r'<p class="(?:line|sound)[^"]*"[^>]*>(.*?)</p>', sheet, re.S):
        tail = [w for w in words(para)][-3:]
        # last resort for Arabic: pdftotext sometimes files one letter of a word
        # on another line (سَان came back as سَا … ن); the word counts as present
        # if all its letters are on the page. The browser's own overflow check
        # (print-pages.js -> data-overflow, run by print-book.sh) is the real guard.
        missing = [w for w in tail if sig(w) not in on_page
                   and not (re.search('[\u0600-\u06FF]', w) and not (Counter(sig(w)) - letters))]
        if missing:
            problems.append('clipped: …' + ' '.join(tail))
    sizes = [(b - a) / 1.41 for a, b, _ in boxes if (b - a) / 1.41 >= 9]   # skip QR caption and folio
    if 'sheet blank' not in sheet and 'class="line' in sheet and sizes:
        med = statistics.median(sizes)
        if med < min_pt:
            problems.append(f'small: median {med:.1f}pt < {min_pt}pt')
    for p in problems:
        print(f'  p{n}: {p}'); bad += 1

print(f'{pdf}: {len(pages)} pages, ' + ('clean' if not bad else f'{bad} problem(s)'))
sys.exit(1 if bad else 0)
