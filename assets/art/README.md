# Illustrated artwork — رُسُومٌ مُلَوَّنَةٌ

The generated picture set for the Nawras site, drawn locally with Draw Things
(`draw-things-cli`, Z-Image Turbo), one picture at a time, in the same style and with
the same character descriptions as the lesson book (`book/source/gen-noori-shell.sh`).
Every picture was checked by eye; rejected draws are kept in `hi/tries/` with their seed.

## The Artwork switch

`assets/kids.js` → `KS.art()`:

| Mode | Label | What shows |
|---|---|---|
| `ill` (default) | رُسُومٌ مُلَوَّنَةٌ · Illustrated | the WebP pictures in this folder |
| `svg` | رُسُومٌ بَسِيطَةٌ · Simple | the hand-drawn inline SVG (as before) |

- The switch sits in the floating theme panel (palette button) and in the story's settings
  panel. The choice is saved in `localStorage['nawras-art']` (wrapped in try/catch) and
  mirrored on `<html data-art="ill|svg">`.
- `KS.pic(name)` / `KS.gull(mood)` return an `<img>` in illustrated mode. If the file is
  missing the `<img onerror>` swaps itself back to the SVG (`KS.artFallback`). `{svg:true}`
  forces the SVG (the site logo and the book's print pages use it).
- Static page art uses two classes (in `kids.css`): `.ill-only` (hidden in simple mode) and
  `.svg-only` (hidden in illustrated mode, unless its `[data-art-slot]` got `.art-miss`
  because the picture failed to load).
- Switching re-draws every picture on the page in place (`KS.refreshArt`) and fires a
  `ks:art` event.
- All paths are relative (`../assets/art/…` in pages; `KS` finds this folder next to
  `kids.js`), so the site works from `file://` and from
  `https://hisham-abuella.github.io/Madrasa/`.

## Folders

```
hi/              1536px PNG masters (never referenced by a page)  — not for the web build
hi/tries/        rejected draws, named <group>-<key>-<seed>.png
pic/<name>.webp  the 24 KS.pic word pictures, transparent (people 480×640, others 640×640)
noori/<mood>.webp  Noori stickers: happy wave fly think cheer sleep (transparent, 640×640)
story/sNN-*.webp   one scene per slide of lessons/story.html (1200×800)
site/hero-*.webp   one hero per mockup theme; level-*.webp the 4 level cards;
                   wotd-*.webp word-of-the-day pictures; parents.webp the parents strip
og/<theme>.jpg     1200×630 share cards (JPEG: what social sites read best)
source/            gen-art.sh (prompts + seeds + review log), make-web.py, og.html, make-og.js
```

## Rebuild

```sh
zsh assets/art/source/gen-art.sh              # masters (skips existing; ~90 s each at 1536px)
ONLY="pic/cat" SEED_ADD=100 zsh assets/art/source/gen-art.sh   # try another seed → hi/tries/
python3 assets/art/source/make-web.py         # WebP copies (white → transparent for stickers)
node assets/art/source/make-og.js             # share cards (typeset wordmark over a scene)
python3 book/tools/contact-sheet.py sheet.png assets/art/hi/pic/*.png   # review sheet
```

## Sizes (2026-10-25)

Web copies: **2.4 MB** in total — pic 24 files 604 KB · noori 6 files 164 KB · story 13
files 528 KB · site 14 files 604 KB · og 6 files 496 KB; the largest single file is 90 KB.
Masters + tries in `hi/`: 125 MB (keep them out of the published site if size matters).

## What is reused from the book

Story slides 1, 2, 3, 10 and 13 use the book's pictures (`book/art-hi/images-noori-shell/`
cover, salam, friends, nashit, sadiq), cropped to 3:2 by `make-web.py`. On those slides
the drawn stand-ins are hidden and the tap words (سَامِي، سَلْمَى، نُورِي …) sit over the
picture; the other slides put the illustrated stickers on a generated beach background.

## Content rules kept

No text in any picture (every word is typeset by the page); modest dress on every person
(headscarf covering hair and neck, long sleeves, long dress over trousers, socks and shoes);
the grown-ups appear only as the teacher / mother word pictures and the parents strip;
the she-cat is a calico with a collar (no bow); Noori always wears his teal scarf.
